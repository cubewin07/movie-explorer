package com.Backend.services.chat_service.message.dto;

import com.Backend.services.chat_service.message.model.Message;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private String content;
    private Long senderId;
    private String senderUsername;
    private Boolean isRead;
    private LocalDateTime createdAt;

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


