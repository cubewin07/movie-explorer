package com.Backend.services.chat_service.message.service;

import com.Backend.services.chat_service.message.dto.MarkAsReadNotificationDTO;
import com.Backend.services.chat_service.message.dto.MessageDTOPage;
import com.Backend.services.chat_service.model.Chat;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Backend.exception.ChatNotFoundException;
import com.Backend.exception.MessageValidationException;
import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.chat_service.message.dto.MessageDTO;
import com.Backend.services.chat_service.message.repository.MessageRepository;
import com.Backend.services.chat_service.model.ChatLookUpHelper;
import com.Backend.services.user_service.model.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class MessageService {
    
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MIN_PAGE_NUMBER = 0;
    private static final int MIN_PAGE_SIZE = 1;
    
    private final MessageRepository messageRepository;
    private final ChatLookUpHelper chatLookUpHelper;
    private final SimpMessagingTemplate template;

    // ==================== Send Message ====================

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "messagesDTO", allEntries = true),
        @CacheEvict(value = "latestMessageDTO", key = "#chatId"),
        @CacheEvict(value = "userMeDTO", allEntries = true)
    })
    public Message sendMessage(String text, Long chatId, User sender) {
        validateMessageText(text);
        validateNotNull(sender, "Sender");
        
        log.debug("Sending message to chat: {}", chatId);
        
        Chat chat = chatLookUpHelper.getChatById(chatId);
        
        Message message = Message.builder()
            .content(text)
            .chat(chat)
            .sender(sender)
            .build();
            
        Message savedMessage = messageRepository.save(message);
        log.info("Message sent successfully with id: {}", savedMessage.getId());
        
        return savedMessage;
    }

    // ==================== Retrieve Messages ====================

    @Transactional(readOnly = true)
    @Cacheable(value = "messagesDTO", key = "#chatId + '-' + #page + '-' + #size")
    public MessageDTOPage getMessagesDTO(Long chatId, int page, int size) {
        validateNotNull(chatId, "Chat ID");
        
        normalizePage(page);
        normalizePageSize(size);

        log.debug("Fetching message DTOs for chat: {}, page: {}, size: {} from database", chatId, page, size);
        
        verifyChatExists(chatId);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Message> messages = messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable);
        
        Page<MessageDTO> messageDTOs = messages.map(message -> 
            new MessageDTO(
                message.getId(),
                message.getContent(),
                message.getSender().getId(),
                message.getSender().getRealUsername(),
                message.isRead(),
                message.getCreatedAt()
            )
        );

        log.info("Found {} message DTOs for chat: {}", messageDTOs.getTotalElements(), chatId);


        return MessageDTOPage.builder()
                .messages(messageDTOs.getContent())
                .totalMessagesAcrossAllPage(messageDTOs.getTotalElements())
                .build();
    }

    @Transactional(readOnly = true)
    public MessageDTOPage getMessagesDTO(Long chatId, int page) {
        return getMessagesDTO(chatId, page, DEFAULT_PAGE_SIZE);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "latestMessageDTO", key = "#chatId")
    public MessageDTO getLatestMessageDTO(Long chatId) {
        validateNotNull(chatId, "Chat ID");
        
        log.debug("Fetching latest message DTO for chat: {} from database", chatId);
        
        verifyChatExists(chatId);
        
        Message message = messageRepository.findTopByChatIdOrderByCreatedAtDesc(chatId)
            .orElse(null);
        
        if (message == null) {
            return null;
        }
        
        return new MessageDTO(
            message.getId(),
            message.getContent(),
            message.getSender().getId(),
            message.getSender().getRealUsername(),
            message.isRead(),
            message.getCreatedAt()
        );
    }

    // ==================== Mark message(s) as read ====================

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "chatNotifications", key = "#user.id"),
        @CacheEvict(value = "notifications", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email"),
        @CacheEvict(value = "chats", key = "#user.id")
    })
    public void markMessagesAsRead(Long chatId, User user) {
        validateNotNull(chatId, "Chat ID");
        validateNotNull(user, "User");

        Long userId = user.getId();

        Set<Message> unReadMessages = messageRepository.findByChat_IdAndSender_IdNotAndIsReadFalse(chatId, userId);
        log.info("Found {} un-read messages for chat: {}", unReadMessages.size(), chatId);

        if (!unReadMessages.isEmpty()) {
            //  Mark as read in database
            unReadMessages.forEach(message -> message.setRead(true));
            messageRepository.saveAll(unReadMessages);
            log.info("Successfully marked {} messages as read for chat: {}", unReadMessages.size(), chatId);

            // Broadcast STOMP event to all subscribers of the chat topic (including the sender)
            MarkAsReadNotificationDTO markAsReadDTO = MarkAsReadNotificationDTO.builder()
                    .type("markAsRead")
                    .chatId(chatId)
                    .userId(userId)
                    .senderName(user.getRealUsername())
                    .message(user.getRealUsername() + " has marked all messages in chat as read")
                    .build();
            template.convertAndSend("/topic/chat/" + chatId, markAsReadDTO);
            log.info("Successfully broadcast mark-as-read notification for chat: {}", chatId);


        } else {
            log.info("No un-read messages found for chat: {}", chatId);
        }
    }

    
    // ==================== Private Helper Methods ====================
    
    private void verifyChatExists(Long chatId) {
        if (!chatLookUpHelper.chatExists(chatId)) {
            throw new ChatNotFoundException("Chat not found with id: " + chatId);
        }
    }
    
    private void validateNotNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new MessageValidationException(fieldName + " cannot be null");
        }
    }
    
    private void validateMessageText(String text) {
        if (text == null || text.trim().isEmpty()) {
            throw new MessageValidationException("Message text cannot be empty");
        }
    }
    
    private void normalizePage(int page) {
        if (page < MIN_PAGE_NUMBER) {
            throw new MessageValidationException("Page number cannot be less than " + MIN_PAGE_NUMBER);
        }
    }
    
    private void normalizePageSize(int size) {
        if (size < MIN_PAGE_SIZE) {
            throw new MessageValidationException("Page size must be at least " + MIN_PAGE_SIZE);
        }
    }
}