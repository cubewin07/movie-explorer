package com.Backend.services.chat_service.service;

import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.Backend.exception.ChatNotFoundException;
import com.Backend.exception.UserNotFoundException;
import com.Backend.services.chat_service.model.Chat;
import com.Backend.services.chat_service.repository.ChatRepository;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {
    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public Chat createChat(User user1, User user2) {
        if (user1 == null || user2 == null) {
            log.error("Failed to create chat: One or both users are null");
            throw new IllegalArgumentException("Users cannot be null");
        }
        
        log.debug("Creating chat between users: {} and {}", user1.getId(), user2.getId());
        try {
            Chat chat = Chat.builder().build();
            chat.addParticipant(user1);
            chat.addParticipant(user2);
            Chat savedChat = chatRepository.save(chat);
            log.info("Successfully created chat with id: {}", savedChat.getId());
            return savedChat;
        } catch (Exception e) {
            log.error("Error creating chat between users {} and {}: {}", 
                user1.getId(), user2.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to create chat", e);
        }
    }

    public Chat createChat(Long user1Id, Long user2Id) {
        log.debug("Creating chat between user IDs: {} and {}", user1Id, user2Id);
        User user1 = userRepository.findById(user1Id)
            .orElseThrow(() -> {
                log.error("User not found with id: {}", user1Id);
                return new UserNotFoundException("User not found with id: " + user1Id);
            });
            
        User user2 = userRepository.findById(user2Id)
            .orElseThrow(() -> {
                log.error("User not found with id: {}", user2Id);
                return new UserNotFoundException("User not found with id: " + user2Id);
            });
            
        return createChat(user1, user2);
    }

    public Chat createChat(String username1, String username2) {
        log.debug("Creating chat between usernames: {} and {}", username1, username2);
        User user1 = userRepository.findByUsername(username1)
            .orElseThrow(() -> {
                log.error("User not found with username: {}", username1);
                return new UserNotFoundException("User not found with username: " + username1);
            });
            
        User user2 = userRepository.findByUsername(username2)
            .orElseThrow(() -> {
                log.error("User not found with username: {}", username2);
                return new UserNotFoundException("User not found with username: " + username2);
            });
            
        return createChat(user1, user2);
    }

    public Set<Chat> getChats(User user) {
        if (user == null) {
            log.error("Cannot get chats: User is null");
            throw new IllegalArgumentException("User cannot be null");
        }
        
        log.debug("Fetching chats for user: {}", user.getId());
        try {
            Set<Chat> chats = chatRepository.findByParticipantsContaining(user);
            log.info("Found {} chats for user: {}", chats.size(), user.getId());
            return chats;
        } catch (Exception e) {
            log.error("Error fetching chats for user {}: {}", user.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to fetch chats", e);
        }
    }

    public Set<User> getParticipants(Long chatId) {
        log.debug("Fetching participants for chat: {}", chatId);
        Chat chat = chatRepository.findById(chatId)
            .orElseThrow(() -> {
                log.error("Chat not found with id: {}", chatId);
                return new ChatNotFoundException("Chat not found with id: " + chatId);
            });
            
        return chat.getParticipants();
    }

    @Transactional
    public Chat createGroupChat(Set<User> users) {
        if (users == null || users.isEmpty()) {
            log.error("Cannot create group chat: Users set is null or empty");
            throw new IllegalArgumentException("Users set cannot be null or empty");
        }
        
        log.debug("Creating group chat with {} users", users.size());
        try {
            Chat chat = Chat.builder().build();
            users.forEach(chat::addParticipant);
            Chat savedChat = chatRepository.save(chat);
            log.info("Successfully created group chat with id: {}", savedChat.getId());
            return savedChat;
        } catch (Exception e) {
            log.error("Error creating group chat: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create group chat", e);
        }
    }

    public Chat createGroupChatByIds(Set<Long> userIds) {
        if (userIds == null || userIds.size() < 3) {
            log.error("At least 3 user IDs are required to create a group chat");
            throw new IllegalArgumentException("At least 3 users are required to create a group chat");
        }
        
        log.debug("Creating group chat with user IDs: {}", userIds);
        try {
            Set<User> users = userIds.stream()
                .map(id -> userRepository.findById(id)
                    .orElseThrow(() -> {
                        log.error("User not found with id: {}", id);
                        return new UserNotFoundException("User not found with id: " + id);
                    }))
                .collect(Collectors.toSet());
                
            if (users.size() < 3) {
                String errorMsg = "At least 3 valid users are required to create a group chat";
                log.error(errorMsg);
                throw new IllegalArgumentException(errorMsg);
            }
            
            return createGroupChat(users);
        } catch (UserNotFoundException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error creating group chat: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create group chat", e);
        }
    }

    @Transactional
    public Chat getChatById(Long id) {
        if (id == null) {
            log.error("Chat ID cannot be null");
            throw new IllegalArgumentException("Chat ID cannot be null");
        }
        
        log.debug("Fetching chat with id: {}", id);
        return chatRepository.findById(id)
            .orElseThrow(() -> {
                log.error("Chat not found with id: {}", id);
                return new ChatNotFoundException("Chat not found with id: " + id);
            });
    }

    @Transactional
    public void addParticipant(Chat chat, User user) {
        if (chat == null || user == null) {
            log.error("Cannot add participant: Chat or User is null");
            throw new IllegalArgumentException("Chat and User cannot be null");
        }
        
        log.debug("Adding user {} to chat {}", user.getId(), chat.getId());
        try {
            chat.addParticipant(user);
            chatRepository.save(chat);
            log.info("Successfully added user {} to chat {}", user.getId(), chat.getId());
        } catch (Exception e) {
            log.error("Error adding user {} to chat {}: {}", 
                user.getId(), chat.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to add participant to chat", e);
        }
    }

    @Transactional
    public void removeParticipant(Chat chat, User user) {
        if (chat == null || user == null) {
            log.error("Cannot remove participant: Chat or User is null");
            throw new IllegalArgumentException("Chat and User cannot be null");
        }
        
        log.debug("Removing user {} from chat {}", user.getId(), chat.getId());
        try {
            chat.removeParticipant(user);
            chatRepository.save(chat);
            log.info("Successfully removed user {} from chat {}", user.getId(), chat.getId());
        } catch (Exception e) {
            log.error("Error removing user {} from chat {}: {}", 
                user.getId(), chat.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to remove participant from chat", e);
        }
    }

    @Transactional
    public void deleteChat(Chat chat) {
        if (chat == null) {
            log.error("Cannot delete chat: Chat is null");
            throw new IllegalArgumentException("Chat cannot be null");
        }
        
        log.debug("Deleting chat with id: {}", chat.getId());
        try {
            chatRepository.delete(chat);
            log.info("Successfully deleted chat with id: {}", chat.getId());
        } catch (Exception e) {
            log.error("Error deleting chat {}: {}", chat.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to delete chat", e);
        }
    }
}
