package com.Backend.services.chat_service.message.dto;

import com.Backend.services.chat_service.message.model.Message;

import java.time.LocalDateTime;

public record MessageDTO(
    Long id,
    String content,
    Long senderId,
    String senderUsername,
    Boolean isRead,
    LocalDateTime createdAt
) {
    public static MessageDTO fromMessage(Message message) {
        Long id = message.getSender().getId();
        String username = message.getSender().getRealUsername();
        return new MessageDTO(
                message.getId(),
                message.getContent(),
                id,
                username,
                message.isRead(),
                message.getCreatedAt()
        );
    }
}


