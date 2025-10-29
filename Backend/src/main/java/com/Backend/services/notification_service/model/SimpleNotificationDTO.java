package com.Backend.services.notification_service.model;

import com.Backend.services.user_service.model.User;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SimpleNotificationDTO {
    private User user;
    private String type;
    private Long id;
    private String message;

}
