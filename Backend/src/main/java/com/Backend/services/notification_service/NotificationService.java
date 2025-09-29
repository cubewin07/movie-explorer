package com.Backend.services.notification_service;

import java.time.LocalDateTime;

import com.Backend.services.user_service.model.User;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepo notificationRepo;
    private final SimpMessagingTemplate template;
    
    public void createNotification(User user, String type, Long relatedId, String message) {
        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .relatedId(relatedId)
            .message(message)
            .isRead(false)
            .createdAt(LocalDateTime.now())
            .build();
        notificationRepo.save(notification);
        template.convertAndSend("/topic/notifications/" + user.getId(), notification);
    }
}
