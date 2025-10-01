package com.Backend.services.notification_service;

import java.time.LocalDateTime;
import java.util.List;

import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.user_service.model.User;
import com.Backend.websocket.eventListener.STOMPEventListener;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepo notificationRepo;
    private final SimpMessagingTemplate template;
    private final STOMPEventListener stompEventListener;
    
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
        if(type.equals("updates")) {
            template.convertAndSend("/topic/updates", notification);
        }
        if(stompEventListener.isUserOnline(user.getUsername())) {
            template.convertAndSend("/topic/notifications/" + user.getId(), notification);
        }
    }
    public void createNotification(User user, String type, Long relatedId, Message message) {

        String messageContent = message.getContent();
        
        if(type.equals("chat")) {
            messageContent = message.getSender().getUsername() + ": " + message.getContent();
        }
        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .relatedId(relatedId)
            .message(messageContent)
            .isRead(false)
            .createdAt(LocalDateTime.now())
            .build();
            notificationRepo.save(notification);
        if(type.equals("updates")) {
            template.convertAndSend("/topic/updates", notification);
        }
        if(stompEventListener.isUserOnline(user.getUsername())) {
            template.convertAndSend("/topic/notifications/" + user.getId(), notification);
        }
    }


    public List<Notification> getChatNotifications(User user) {
        return notificationRepo.findByUserAndType(user, "chat");
    }

    public void markNotificationAsRead(User user, Long notificationId) {
        Notification notification = notificationRepo.findById(notificationId).orElse(null);
        if(notification != null && notification.getUser().equals(user)) {
            notification.setRead(true);
            notificationRepo.save(notification);
            if(stompEventListener.isUserOnline(user.getUsername())) {
                template.convertAndSend("/topic/notifications/" + user.getId(), notification);
            }
        }
    }
    
    public void deleteNotification(User user, Long notificationId) {
        Notification notification = notificationRepo.findById(notificationId).orElse(null);
        if(notification != null && notification.getUser().equals(user)) {
            notificationRepo.delete(notification);
        }
    }
}