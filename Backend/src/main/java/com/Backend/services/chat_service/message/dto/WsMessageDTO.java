package com.Backend.services.chat_service.message.dto;

import com.Backend.services.chat_service.message.model.Message;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class WsMessageDTO {
    private Long id;
    private String type;
    private String content;
    private Long senderId;
    private Long chatId;
    private String senderUsername;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static WsMessageDTO fromMessage(Message message, Long chatId) {
        Long id = message.getSender().getId();
        String username = message.getSender().getRealUsername();
        return new WsMessageDTO(
                message.getId(),
                "confirmMessage",
                message.getContent(),
                id,
                chatId,
                username,
                message.isRead(),
                message.getCreatedAt()
        );
    }
}
