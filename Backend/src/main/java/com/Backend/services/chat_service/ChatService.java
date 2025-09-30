package com.Backend.services.chat_service;

import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.Backend.services.chat_service.message.Message;
import com.Backend.services.chat_service.message.MessageRepository;
import com.Backend.services.user_service.model.User;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    
    @Transactional
    public Chat createChat(User user1, User user2) {
        Chat chat = Chat.builder()
            .build();
        chat.addParticipant(user1);
        chat.addParticipant(user2);
        return chatRepository.save(chat);
    }

    public Set<Chat> getChats(User user) {
        return chatRepository.findByParticipantsContaining(user);
    }

    public Page<Message> getMessages(Long chatId, Pageable pageable) {
        return messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);
    }

    public Page<Message> getMessages(Long chatId) {
        Pageable pageable = PageRequest.of(0, 20);
        return messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);
    }

    @Transactional
    public Chat createGroupChat(Set<User> users) {
        Chat chat = Chat.builder()
            .build();
        users.forEach(user -> chat.addParticipant(user));
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
