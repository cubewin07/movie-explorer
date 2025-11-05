package com.Backend.services.chat_service.service;

import java.util.Set;
import java.util.stream.Collectors;

import com.Backend.services.chat_service.message.dto.MessageDTO;
import com.Backend.services.chat_service.message.service.MessageService;
import com.Backend.services.chat_service.model.ChatLookUpHelper;
import com.Backend.services.chat_service.model.DTO.ChatResponseDTO;
import com.Backend.services.notification_service.model.UserIdAndChatId;
import com.Backend.services.user_service.model.UserLookUpHelper;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Backend.exception.ChatNotFoundException;
import com.Backend.exception.ChatValidationException;
import com.Backend.services.chat_service.model.Chat;
import com.Backend.services.chat_service.model.DTO.SimpleChatDTO;
import com.Backend.services.chat_service.model.DTO.ChatDTO;
import com.Backend.services.chat_service.repository.ChatRepository;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.model.DTO.SimpleUserDTO;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    
    private static final int MIN_GROUP_CHAT_PARTICIPANTS = 3;

    private final ChatRepository chatRepository;
    private final ChatLookUpHelper chatLookUpHelper;
    private final UserLookUpHelper userLookUpHelper;
    private final ApplicationEventPublisher publisher;
    private final MessageService messageService;
    
    // ==================== Create Chat Methods ====================
    
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "chats", key = "#user1.id"),
        @CacheEvict(value = "chats", key = "#user2.id"),
        @CacheEvict(value = "userMeDTO", key = "#user1.email"),
        @CacheEvict(value = "userMeDTO", key = "#user2.email")
    })
    public SimpleChatDTO createChat(User user1, User user2) {
        validateNotNull(user1, "User 1");
        validateNotNull(user2, "User 2");

        if (user1.getId().equals(user2.getId())) {
            throw new ChatValidationException("Cannot create a chat with the same user");
        }

        chatRepository.findPrivateChat(user1, user2).ifPresent(existing -> {
            throw new ChatValidationException("A private chat between these users already exists (id=" + existing.getId() + ")");
        });
        
        log.debug("Creating chat between users: {} and {}", user1.getId(), user2.getId());
        
        Chat chat = Chat.builder().build();
        chat.addParticipant(user1);
        chat.addParticipant(user2);
        
        Chat savedChat = chatRepository.save(chat);
        Long chatId = savedChat.getId();
        log.info("Successfully created chat with id: {}", savedChat.getId());

        savedChat.getParticipants().forEach(user -> {
            UserIdAndChatId userAndChatId = UserIdAndChatId.builder()
                    .userId(user.getId())
                    .chatId(chatId)
                    .build();
            publisher.publishEvent(userAndChatId);

        });

        return new SimpleChatDTO(savedChat.getId(), convertToSimpleUserDTOs(savedChat.getParticipants()));
    }

    @Transactional
    public SimpleChatDTO createChat(Long user1Id, Long user2Id) {
        log.debug("Creating chat between user IDs: {} and {}", user1Id, user2Id);
        
        User user1 = findUserById(user1Id);
        User user2 = findUserById(user2Id);

        return createChat(user1, user2);
    }

    @Transactional
    public SimpleChatDTO createChat(String username1, String username2) {
        log.debug("Creating chat between usernames: {} and {}", username1, username2);
        
        User user1 = findUserByUsername(username1);
        User user2 = findUserByUsername(username2);
        
        return createChat(user1, user2);
    }
    
    // ==================== Create Group Chat Methods ====================

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "chats", allEntries = true),
        @CacheEvict(value = "userMeDTO", allEntries = true)
    })
    public Chat createGroupChat(Set<User> users) {
        validateNotNull(users, "Users set");
        
        if (users.isEmpty()) {
            throw new IllegalArgumentException("Users set cannot be empty");
        }
        
        log.debug("Creating group chat with {} users", users.size());
        
        Chat chat = Chat.builder().build();
        users.forEach(chat::addParticipant);
        
        Chat savedChat = chatRepository.save(chat);
        
        // Evict userMeDTO for all participants
        users.forEach(user -> {
            log.debug("Evicting userMeDTO cache for user: {}", user.getEmail());
        });
        
        log.info("Successfully created group chat with id: {}", savedChat.getId());
        
        return savedChat;
    }

    @Transactional
    public Chat createGroupChatByIds(Set<Long> userIds) {
        validateGroupChatUserIds(userIds);
        
        log.debug("Creating group chat with user IDs: {}", userIds);
        
        Set<User> users = fetchUsersByIds(userIds);
        validateGroupChatSize(users);
        
        return createGroupChat(users);
    }

    // ==================== Getting chat (ChatResponseDTO) ====================
    public ChatResponseDTO gettingChatDTO(Long chatId) {
        // Using cached DTO methods for better performance
        ChatDTO chatDTO = chatLookUpHelper.getChatByIdDTO(chatId);
        MessageDTO latestMessageDTO = messageService.getLatestMessageDTO(chatId);

        return new ChatResponseDTO(
                chatId,
                chatDTO.participants(),
                latestMessageDTO != null ? latestMessageDTO.content() : null,
                latestMessageDTO != null ? latestMessageDTO.senderUsername() : null,
                latestMessageDTO != null ? latestMessageDTO.createdAt() : null
        );
    }


    // ==================== Modify Chat Methods ====================

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "chatByIdDTO", key = "#chat.id"),
        @CacheEvict(value = "chatParticipants", key = "#chat.id"),
        @CacheEvict(value = "chats", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    public void addParticipant(Chat chat, User user) {
        validateNotNull(chat, "Chat");
        validateNotNull(user, "User");
        
        log.debug("Adding user {} to chat {}", user.getId(), chat.getId());
        
        chat.addParticipant(user);
        chatRepository.save(chat);
        
        log.info("Successfully added user {} to chat {}", user.getId(), chat.getId());
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "chatByIdDTO", key = "#chat.id"),
        @CacheEvict(value = "chatParticipants", key = "#chat.id"),
        @CacheEvict(value = "chats", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    public void removeParticipant(Chat chat, User user) {
        validateNotNull(chat, "Chat");
        validateNotNull(user, "User");
        
        log.debug("Removing user {} from chat {}", user.getId(), chat.getId());
        
        chat.removeParticipant(user);
        chatRepository.save(chat);
        
        log.info("Successfully removed user {} from chat {}", user.getId(), chat.getId());
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "chatByIdDTO", key = "#chat.id"),
            @CacheEvict(value = "chatParticipants", key = "#chat.id"),
            @CacheEvict(value = "chats", allEntries = true),
            @CacheEvict(value = "messagesDTO", allEntries = true),
            @CacheEvict(value = "latestMessageDTO", key = "#chat.id"),
            @CacheEvict(value = "userMeDTO", allEntries = true)
    })
    public void deleteChat(Chat chat) {
        validateNotNull(chat, "Chat");
        
        log.debug("Deleting chat with id: {}", chat.getId());
        
        chatRepository.delete(chat);
        
        log.info("Successfully deleted chat with id: {}", chat.getId());
    }
    
    // ==================== Private Helper Methods ====================
    
    private User findUserById(Long userId) {
        return userLookUpHelper.getUserById(userId);
    }
    
    private User findUserByUsername(String username) {
        return userLookUpHelper.getUserByUsername(username);
    }
    
    private Set<User> fetchUsersByIds(Set<Long> userIds) {
        return userIds.stream()
            .map(this::findUserById)
            .collect(Collectors.toSet());
    }
    
    private void validateNotNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new ChatValidationException(fieldName + " cannot be null");
        }
    }
    
    private void validateGroupChatUserIds(Set<Long> userIds) {
        if (userIds == null || userIds.size() < MIN_GROUP_CHAT_PARTICIPANTS) {
            throw new ChatValidationException(
                "At least " + MIN_GROUP_CHAT_PARTICIPANTS + " user IDs are required to create a group chat"
            );
        }
    }
    
    private void validateGroupChatSize(Set<User> users) {
        if (users.size() < MIN_GROUP_CHAT_PARTICIPANTS) {
            throw new ChatValidationException(
                "At least " + MIN_GROUP_CHAT_PARTICIPANTS + " valid users are required to create a group chat"
            );
        }
    }


    // ==================== Public Helper Methods ====================
    public Set<SimpleUserDTO> convertToSimpleUserDTOs(Set<User> users) {
        return users.stream()
            .map(user -> {
                SimpleUserDTO dto = new SimpleUserDTO();
                dto.setId(user.getId());
                dto.setEmail(user.getEmail());
                dto.setUsername(user.getUsername());
                return dto;
            })
            .collect(Collectors.toSet());
    }

    public MessageDTO getChatSummaryDTO(Long chatId) {
        return messageService.getLatestMessageDTO(chatId);
    }
}