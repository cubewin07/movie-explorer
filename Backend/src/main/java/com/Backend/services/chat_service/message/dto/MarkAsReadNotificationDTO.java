package com.Backend.services.chat_service.message.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MarkAsReadNotificationDTO {
    private Long chatId;
    private Long userId;
    private String senderName;
    private String type;
    private String message;
}
