package com.Backend.services.chat_service.message.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MarkAsReadNotificationDTO {
    private Long chatId;
    private Long userId;
    private String senderName;
    private String type;
    private String message;
}
