package com.Backend.services.chat_service.message.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.Backend.exception.ChatNotFoundException;
import com.Backend.exception.MessageNotFoundException;
import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.chat_service.message.repository.MessageRepository;
import com.Backend.services.chat_service.model.Chat;
import com.Backend.services.chat_service.repository.ChatRepository;
import com.Backend.services.user_service.model.User;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MessageService {
    private static final Logger logger = LoggerFactory.getLogger(MessageService.class);
    
    private final MessageRepository messageRepository;
    private final ChatRepository chatRepository;

    @Transactional
    public Message sendMessage(String text, Long chatId, User sender) {
        if (text == null || text.trim().isEmpty()) {
            logger.error("Cannot send message: Message text is empty");
            throw new IllegalArgumentException("Message text cannot be empty");
        }
        
        if (sender == null) {
            logger.error("Cannot send message: Sender is null");
            throw new IllegalArgumentException("Sender cannot be null");
        }
        
        logger.debug("Sending message to chat: {}", chatId);
        try {
            Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> {
                    logger.error("Chat not found with id: {}", chatId);
                    return new ChatNotFoundException("Chat not found with id: " + chatId);
                });
                
            Message message = Message.builder()
                .content(text)
                .chat(chat)
                .sender(sender)
                .build();
                
            Message savedMessage = messageRepository.save(message);
            logger.info("Message sent successfully with id: {}", savedMessage.getId());
            return savedMessage;
        } catch (ChatNotFoundException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error sending message to chat {}: {}", chatId, e.getMessage(), e);
            throw new RuntimeException("Failed to send message", e);
        }
    }


    public Page<Message> getMessages(Long chatId, int page, int size) {
        if (chatId == null) {
            logger.error("Cannot get messages: Chat ID is null");
            throw new IllegalArgumentException("Chat ID cannot be null");
        }
        
        if (page < 0) {
            logger.warn("Page number cannot be negative, defaulting to 0");
            page = 0;
        }
        
        if (size <= 0) {
            logger.warn("Page size must be positive, defaulting to 20");
            size = 20;
        }
        
        logger.debug("Fetching messages for chat: {}, page: {}, size: {}", chatId, page, size);
        try {
            if (!chatRepository.existsById(chatId)) {
                logger.error("Chat not found with id: {}", chatId);
                throw new ChatNotFoundException("Chat not found with id: " + chatId);
            }
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Message> messages = messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);
            logger.info("Found {} messages for chat: {}", messages.getTotalElements(), chatId);
            return messages;
        } catch (ChatNotFoundException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error fetching messages for chat {}: {}", chatId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch messages", e);
        }
    }

    public Page<Message> getMessages(Long chatId, int page) {
        // Default page size of 20 messages per page
        return getMessages(chatId, page, 20);
    }

    public Message getLatestMessage(Long chatId) {
        if (chatId == null) {
            logger.error("Cannot get latest message: Chat ID is null");
            throw new IllegalArgumentException("Chat ID cannot be null");
        }
        
        logger.debug("Fetching latest message for chat: {}", chatId);
        try {
            if (!chatRepository.existsById(chatId)) {
                logger.error("Chat not found with id: {}", chatId);
                throw new ChatNotFoundException("Chat not found with id: " + chatId);
            }
            
            return messageRepository.findTopByChatIdOrderByCreatedAtDesc(chatId)
                .orElseThrow(() -> {
                    logger.info("No messages found for chat: {}", chatId);
                    return new MessageNotFoundException("No messages found for chat: " + chatId);
                });
        } catch (ChatNotFoundException | MessageNotFoundException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error fetching latest message for chat {}: {}", chatId, e.getMessage(), e);
            throw new RuntimeException("Failed to fetch latest message", e);
        }
    }

}
