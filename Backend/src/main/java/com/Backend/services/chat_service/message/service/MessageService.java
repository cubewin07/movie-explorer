package com.Backend.services.chat_service.message.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.chat_service.message.repository.MessageRepository;
import com.Backend.services.chat_service.model.Chat;
import com.Backend.services.chat_service.repository.ChatRepository;
import com.Backend.services.user_service.model.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;

    public void sendMessage(String text, Long chatId, User sender) {
        Chat chat = chatRepository.findById(chatId).orElse(null);
        Message message = Message.builder()
            .content(text)
            .chat(chat)
            .sender(sender)
            .build();
        messageRepository.save(message);
    }


    public Page<Message> getMessages(Long chatId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);
    }

    public Page<Message> getMessages(Long chatId, int page) {
        Pageable pageable = PageRequest.of(page, 20);
        return messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);
    }

}
