package com.Backend.services.chat_service.service;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Backend.exception.ChatNotFoundException;
import com.Backend.exception.ChatValidationException;
import com.Backend.exception.UserNotFoundException;
import com.Backend.services.chat_service.model.Chat;
import com.Backend.services.chat_service.repository.ChatRepository;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {
    
    private static final int MIN_GROUP_CHAT_PARTICIPANTS = 3;
    
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    
    // ==================== Create Chat Methods ====================
    
    @Transactional
    public Chat createChat(User user1, User user2) {
        validateNotNull(user1, "User 1");
        validateNotNull(user2, "User 2");
        
        log.debug("Creating chat between users: {} and {}", user1.getId(), user2.getId());
        
        Chat chat = Chat.builder().build();
        chat.addParticipant(user1);
        chat.addParticipant(user2);
        
        Chat savedChat = chatRepository.save(chat);
        log.info("Successfully created chat with id: {}", savedChat.getId());
        
        return savedChat;
    }

    @Transactional
    public Chat createChat(Long user1Id, Long user2Id) {
        log.debug("Creating chat between user IDs: {} and {}", user1Id, user2Id);
        
        User user1 = findUserById(user1Id);
        User user2 = findUserById(user2Id);
        
        return createChat(user1, user2);
    }

    @Transactional
    public Chat createChat(String username1, String username2) {
        log.debug("Creating chat between usernames: {} and {}", username1, username2);
        
        User user1 = findUserByUsername(username1);
        User user2 = findUserByUsername(username2);
        
        return createChat(user1, user2);
    }
    
    // ==================== Create Group Chat Methods ====================

    @Transactional
    public Chat createGroupChat(Set<User> users) {
        validateNotNull(users, "Users set");
        
        if (users.isEmpty()) {
            throw new IllegalArgumentException("Users set cannot be empty");
        }
        
        log.debug("Creating group chat with {} users", users.size());
        
        Chat chat = Chat.builder().build();
        users.forEach(chat::addParticipant);
        
        Chat savedChat = chatRepository.save(chat);
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
    
    // ==================== Retrieve Chat Methods ====================
    
    @Transactional(readOnly = true)
    public Chat getChatById(Long id) {
        validateNotNull(id, "Chat ID");
        
        log.debug("Fetching chat with id: {}", id);
        
        return chatRepository.findById(id)
            .orElseThrow(() -> new ChatNotFoundException("Chat not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Set<Chat> getChats(User user) {
        validateNotNull(user, "User");
        
        log.debug("Fetching chats for user: {}", user.getId());
        
        Set<Chat> chats = chatRepository.findByParticipantsContaining(user);
        log.info("Found {} chats for user: {}", chats.size(), user.getId());
        
        return chats;
    }

    @Transactional(readOnly = true)
    public Set<User> getParticipants(Long chatId) {
        log.debug("Fetching participants for chat: {}", chatId);
        
        Chat chat = getChatById(chatId);
        return chat.getParticipants();
    }
    
    // ==================== Modify Chat Methods ====================

    @Transactional
    public void addParticipant(Chat chat, User user) {
        validateNotNull(chat, "Chat");
        validateNotNull(user, "User");
        
        log.debug("Adding user {} to chat {}", user.getId(), chat.getId());
        
        chat.addParticipant(user);
        chatRepository.save(chat);
        
        log.info("Successfully added user {} to chat {}", user.getId(), chat.getId());
    }

    @Transactional
    public void removeParticipant(Chat chat, User user) {
        validateNotNull(chat, "Chat");
        validateNotNull(user, "User");
        
        log.debug("Removing user {} from chat {}", user.getId(), chat.getId());
        
        chat.removeParticipant(user);
        chatRepository.save(chat);
        
        log.info("Successfully removed user {} from chat {}", user.getId(), chat.getId());
    }

    @Transactional
    public void deleteChat(Chat chat) {
        validateNotNull(chat, "Chat");
        
        log.debug("Deleting chat with id: {}", chat.getId());
        
        chatRepository.delete(chat);
        
        log.info("Successfully deleted chat with id: {}", chat.getId());
    }
    
    // ==================== Private Helper Methods ====================
    
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found with id: " + userId));
    }
    
    private User findUserByUsername(String username) {
        return userRepository.findByUsername(username)
            .orElseThrow(() -> new UserNotFoundException("User not found with username: " + username));
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
}