package com.Backend.services.notification_service.model;

import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class ListNotificationDTO {
    private Set<Long> notifications;
}
