package com.Backend.services.chat_service.message.dto;

import com.Backend.services.chat_service.message.model.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MessageWebSocketDTO {
    private Long id;
    private String content;
    private Long chatId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private boolean isRead;
    private LocalDateTime createdAt;
    
    public static MessageWebSocketDTO fromMessage(Message message) {
        return MessageWebSocketDTO.builder()
            .id(message.getId())
            .content(message.getContent())
            .chatId(message.getChat() != null ? message.getChat().getId() : null)
            .senderId(message.getSender() != null ? message.getSender().getId() : null)
            .senderName(message.getSender() != null ? message.getSender().getRealUsername() : null)
            .senderEmail(message.getSender() != null ? message.getSender().getEmail() : null)
            .isRead(message.isRead())
            .createdAt(message.getCreatedAt())
            .build();
    }
}