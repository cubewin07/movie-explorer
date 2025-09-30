package com.Backend.services.chat_service;

import java.util.Set;

import org.springframework.stereotype.Service;

import com.Backend.services.user_service.model.User;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    
    @Transactional
    public Chat createChat(User user1, User user2) {
        Chat chat = Chat.builder()
            .participants(Set.of(user1, user2))
            .build();
        return chatRepository.save(chat);
    }

    public Set<Chat> getChats(User user) {
        return user.getChats();
    }

    @Transactional
    public Chat createGroupChat(Set<User> users) {
        Chat chat = Chat.builder()
            .participants(users)
            .build();
        return chatRepository.save(chat);
    }

    @Transactional
    public Chat getChatById(Long id) {
        return chatRepository.findById(id).orElse(null);
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
