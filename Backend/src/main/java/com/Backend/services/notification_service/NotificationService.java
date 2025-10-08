package com.Backend.services.notification_service;

import java.time.LocalDateTime;
import java.util.List;

import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.model.DTO.SimpleUserDTO;
import com.Backend.websocket.eventListener.STOMPEventListener;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.exception.UserNotFoundException;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepo notificationRepo;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate template;
    private final STOMPEventListener stompEventListener;
    
    @Caching(evict = {
        @CacheEvict(value = "chatNotifications", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    public void createNotification(User user, String type, Long relatedId, String message) {
        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .relatedId(relatedId)
            .message(message)
            .createdAt(LocalDateTime.now())
            .build();
        notificationRepo.save(notification);
        log.debug("Notification created for user id={}, type={}", user.getId(), type);

        // Send servers updated to all users
        if(type.equals("updates") && stompEventListener.isUserOnline(user.getUsername())) {
            template.convertAndSend("/topic/updates", notification);
            return;
        }

        // Send notification to a specific user
        if(stompEventListener.isUserOnline(user.getUsername())) {
            template.convertAndSend("/topic/notifications/" + user.getId(), notification);
        }
    }
    
    @Caching(evict = {
        @CacheEvict(value = "chatNotifications", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    public void createNotification(User user, String type, Long relatedId, Message message) {

        String messageContent = message.getContent();

        if(type.equals("chat")) {
            String senderName = message.getSender() != null ? message.getSender().getUsername() : "Unknown";
            messageContent = senderName + ": " + message.getContent();
        }
        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .relatedId(relatedId)
            .message(messageContent)
            .createdAt(LocalDateTime.now())
            .build();
        notificationRepo.save(notification);
        log.debug("Notification created for user id={}, type={}", user.getId(), type);

        // Send servers updated to all users
        if(type.equals("updates") && stompEventListener.isUserOnline(user.getUsername())) {
            template.convertAndSend("/topic/updates", notification);
            return;
        }

        // Send notification to a specific user
        if(stompEventListener.isUserOnline(user.getUsername())) {
            template.convertAndSend("/topic/notifications/" + user.getId(), notification);
        }
    }

    @Caching(evict = {
        @CacheEvict(value = "chatNotifications", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    public void createNotificationWithoutSending(User user, String type, Long relatedId, Message message) {

        String messageContent = message.getContent();

        if(type.equals("chat")) {
            messageContent = message.getSender().getUsername() + ": " + message.getContent();
        }
        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .relatedId(relatedId)
            .message(messageContent)
            .createdAt(LocalDateTime.now())
            .build();
        notificationRepo.save(notification);
        log.debug("Notification created (not sent) for user id={}, type={}", user.getId(), type);
    }

    @Caching(evict = {
        @CacheEvict(value = "chatNotifications", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    public void createNotificationWithoutSending(SimpleUserDTO userDTO, String type, Long relatedId, Message message) {

        String messageContent = message.getContent();
        User user = userRepository.findById(userDTO.getId())
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        if(type.equals("chat")) {
            messageContent = message.getSender().getUsername() + ": " + message.getContent();
        }
        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .relatedId(relatedId)
            .message(messageContent)
            .createdAt(LocalDateTime.now())
            .build();
        notificationRepo.save(notification);
        log.debug("Notification created (not sent) for user id={}, type={}", user.getId(), type);
    }
    
    @Caching(evict = {
        @CacheEvict(value = "chatNotifications", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    public void createNotificationWithoutSending(User user, String type, Long relatedId, String message) {
        Notification notification = Notification.builder()
            .user(user)
            .type(type)
            .relatedId(relatedId)
            .message(message)
            .createdAt(LocalDateTime.now())
            .build();
        notificationRepo.save(notification);
        log.debug("Notification created (not sent) for user id={}, type={}", user.getId(), type);
    }

    @Cacheable(value = "chatNotifications", key = "#user.id")
    public List<Notification> getChatNotifications(User user) {
        log.debug("Fetching chat notifications for user id={} from database", user.getId());
        return notificationRepo.findByUserAndType(user, "chat");
    }

    @Caching(evict = {
        @CacheEvict(value = "chatNotifications", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    public void markNotificationAsRead(User user, Long notificationId) {
        Notification notification = notificationRepo.findById(notificationId).orElse(null);
        if(notification != null && notification.getUser().equals(user)) {
            notification.setRead(true);
            notificationRepo.save(notification);
            log.debug("Notification id={} marked as read for user id={}", notificationId, user.getId());
            if(stompEventListener.isUserOnline(user.getUsername())) {
                template.convertAndSend("/topic/notifications/" + user.getId(), notification);
            }
        }
    }
    
    @Caching(evict = {
        @CacheEvict(value = "chatNotifications", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    public void deleteNotification(User user, Long notificationId) {
        Notification notification = notificationRepo.findById(notificationId).orElse(null);
        if(notification != null && notification.getUser().equals(user)) {
            notificationRepo.delete(notification);
            log.debug("Notification id={} deleted for user id={}", notificationId, user.getId());
        }
    }
}