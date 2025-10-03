package com.Backend.services.user_service.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String type;
    private Long relatedId;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;
}
