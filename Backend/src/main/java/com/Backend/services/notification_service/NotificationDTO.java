package com.Backend.services.notification_service;

import java.time.LocalDateTime;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private Long userId;
    private String type;
    private Long relatedId;
    private String message;
    private boolean isRead;
    private LocalDateTime createdAt;
}