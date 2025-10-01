package com.Backend.services.chat_service;

import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public Chat createChat(User user1, User user2) {
        Chat chat = Chat.builder()
            .build();
        chat.addParticipant(user1);
        chat.addParticipant(user2);
        return chatRepository.save(chat);
    }

    public Chat createChat(Long user1Id, Long user2Id) {
        User user1 = userRepository.findById(user1Id).orElse(null);
        User user2 = userRepository.findById(user2Id).orElse(null);
        if(user1 == null || user2 == null) {
            throw new RuntimeException("User not found");
        }
        return createChat(user1, user2);
    }

    public Chat createChat(String username1, String username2) {
        User user1 = userRepository.findByUsername(username1).orElse(null);
        User user2 = userRepository.findByUsername(username2).orElse(null);
        if(user1 == null || user2 == null) {
            throw new RuntimeException("User not found");
        }
        return createChat(user1, user2);
    }

    public Set<Chat> getChats(User user) {
        return chatRepository.findByParticipantsContaining(user);
    }

    public Set<User> getParticipants(Long chatId) {
        return chatRepository.findById(chatId).orElseThrow(() -> new RuntimeException("Chat not found")).getParticipants();
    }

    @Transactional
    public Chat createGroupChat(Set<User> users) {
        Chat chat = Chat.builder()
            .build();
        users.forEach(user -> chat.addParticipant(user));
        return chatRepository.save(chat);
    }

    public Chat createGroupChatByIds(Set<Long> userIds) {
        Set<User> users = userIds.stream()
            .map(id -> userRepository.findById(id).orElse(null))
            .filter(Objects::nonNull)
            .collect(Collectors.toSet());
        if (users.size() < 3) {
            throw new RuntimeException("At least 3 valid users are required to create a group chat");
        }
        return createGroupChat(users);
    }

    @Transactional
    public Chat getChatById(Long id) {
        return chatRepository.findById(id).orElseThrow(() -> new RuntimeException("Chat not found"));
    }

    @Transactional
    public void addParticipant(Chat chat, User user) {
        chat.addParticipant(user);
    }

    @Transactional
    public void removeParticipant(Chat chat, User user) {
        chat.removeParticipant(user);
    }

    @Transactional
    public void deleteChat(Chat chat) {
        chatRepository.delete(chat);
    }
}
