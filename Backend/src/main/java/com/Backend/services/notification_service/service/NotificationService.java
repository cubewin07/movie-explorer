package com.Backend.services.notification_service.service;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.chat_service.model.Chat;
import com.Backend.services.chat_service.model.DTO.ChatResponseDTO;
import com.Backend.services.chat_service.service.ChatService;
import com.Backend.services.notification_service.model.NewChatNotification;
import com.Backend.services.notification_service.model.Notification;
import com.Backend.services.notification_service.model.NotificationDTO;
import com.Backend.services.notification_service.repository.NotificationRepo;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.model.DTO.SimpleUserDTO;
import com.Backend.services.user_service.service.UserService;
import com.Backend.websocket.eventListener.STOMPEventListener;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.exception.UserNotFoundException;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepo notificationRepo;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate template;
    private final STOMPEventListener stompEventListener;
    private final ChatService chatService;
    private final UserService userService;
    
    @Caching(evict = {
            @CacheEvict(value = "chatNotifications", key = "#user.id"),
            @CacheEvict(value = "userMeDTO", key = "#user.email"),
            @CacheEvict(value = "notifications", key = "#user.id")
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
            @CacheEvict(value = "userMeDTO", key = "#user.email"),
            @CacheEvict(value = "notifications", key = "#user.id")
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
            @CacheEvict(value = "userMeDTO", key = "#user.email"),
            @CacheEvict(value = "notifications", key = "#user.id")
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
            @CacheEvict(value = "userMeDTO", key = "#user.email"),
            @CacheEvict(value = "notifications", key = "#user.id")
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
            @CacheEvict(value = "userMeDTO", key = "#user.email"),
            @CacheEvict(value = "notifications", key = "#user.id")
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
    public List<NotificationDTO> getChatNotifications(User user) {
        log.debug("Fetching chat notifications for user id={} from database", user.getId());
        List<Notification> notifications = notificationRepo.findByUserAndType(user, "chat");
        return notifications.stream().map(n -> NotificationDTO.builder()
                .id(n.getId())
                .type(n.getType())
                .relatedId(n.getRelatedId())
                .message(n.getMessage())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build()).collect(Collectors.toList());
    }


    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "chatNotifications", key = "#user.id"),
            @CacheEvict(value = "userMeDTO", key = "#user.email"),
            @CacheEvict(value = "notifications", key = "#user.id")
    })
    public void markNotificationAsRead(User user, Long notificationId) throws AccessDeniedException {
        Notification notification = notificationRepo.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found with id: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            log.warn("User id={} attempted to mark notification id={} belonging to user id={}",
                    user.getId(), notificationId, notification.getUser().getId());
            throw new AccessDeniedException("You cannot mark others' notifications as read");
        }

        if (notification.isRead()) {
            log.debug("Notification id={} is already marked as read for user id={}", notificationId, user.getId());
            return; // Idempotent operation
        }

        log.debug("Marking notification id={} as read for user id={}", notificationId, user.getId());
        notification.setRead(true);
        notificationRepo.save(notification);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "chatNotifications", key = "#user.id"),
            @CacheEvict(value = "userMeDTO", key = "#user.email"),
            @CacheEvict(value = "notifications", key = "#user.id")
    })
    public void markNotificationAsRead(User user, List<Long> notificationIds) throws AccessDeniedException {
        if (notificationIds == null || notificationIds.isEmpty()) {
            log.debug("Empty notification list provided for user id={}", user.getId());
            return;
        }

        // Remove duplicates
        List<Long> uniqueIds = notificationIds.stream().distinct().collect(Collectors.toList());

        // Verify all notifications belong to the user before updating
        long userNotificationCount = notificationRepo.countByUserIdAndIdIn(user.getId(), uniqueIds);

        if (userNotificationCount == 0) {
            throw new EntityNotFoundException("No notifications found for the current user");
        }

        if (userNotificationCount < uniqueIds.size()) {
            log.warn("User id={} attempted to mark {} notifications but only {} belong to them",
                    user.getId(), uniqueIds.size(), userNotificationCount);
            throw new AccessDeniedException("Some notifications do not belong to you");
        }

        // Update only unread notifications to avoid unnecessary database operations
        int updatedCount = notificationRepo.updateNotificationReadStatus(user.getId(), uniqueIds, true);

        log.debug("Marked {} out of {} notifications as read for user id={}",
                updatedCount, uniqueIds.size(), user.getId());
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "chatNotifications", key = "#user.id"),
            @CacheEvict(value = "userMeDTO", key = "#user.email"),
            @CacheEvict(value = "notifications", key = "#user.id")
    })
    public void markAllNotificationAsRead(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        if (user.getId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        log.debug("Attempting to mark all notifications as read for user id={}", user.getId());

        int updatedCount = notificationRepo.updateAllNotificationReadStatus(user.getId());

        if (updatedCount == 0) {
            log.debug("No unread notifications found for user id={}", user.getId());
        } else {
            log.info("Marked {} notifications as read for user id={}", updatedCount, user.getId());
        }
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "chatNotifications", key = "#user.id"),
            @CacheEvict(value = "userMeDTO", key = "#user.email"),
            @CacheEvict(value = "notifications", key = "#user.id")
    })
    public void deleteNotification(User user, Long notificationId) {
        Notification notification = notificationRepo.findById(notificationId).orElse(null);
        if(notification != null && notification.getUser().equals(user)) {
            notificationRepo.delete(notification);
            log.debug("Notification id={} deleted for user id={}", notificationId, user.getId());
        }
    }

    @Transactional( readOnly = true)
    @Cacheable(value = "notifications", key = "#user.id")
    public Set<NotificationDTO> getNotifications(User user) {
        log.debug("Fetching notifications for user id={} from database", user.getId());
        List<Notification> notifications = notificationRepo.findByUser(user);
        return notifications.stream().map(n -> NotificationDTO.builder()
                .id(n.getId())
                .type(n.getType())
                .relatedId(n.getRelatedId())
                .message(n.getMessage())
                .isRead(n.isRead())
                .createdAt(n.getCreatedAt())
                .build()).collect(Collectors.toSet());
    }

    public void sendNewChatNotification(Long id, Long chatId) {
        User user = userService.getUserById(id);

        if(!stompEventListener.isUserOnline(user.getUsername()))
            return;

        String destination = "/topic/notifications/" + id;
        Chat chat = chatService.getChatById(chatId);
        Set<SimpleUserDTO> participantsDTO = chatService.convertToSimpleUserDTOs(chat.getParticipants());
        ChatResponseDTO dto = new ChatResponseDTO(
                chat.getId(),
                participantsDTO,
                null,
                null,
                LocalDateTime.now()
        );
        NewChatNotification ChatNotification = new NewChatNotification("New_Chat", dto);
        template.convertAndSend(destination, ChatNotification);

    }
}