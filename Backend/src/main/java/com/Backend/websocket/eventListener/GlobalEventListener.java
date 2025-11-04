package com.Backend.websocket.eventListener;

import com.Backend.services.chat_service.message.dto.MessageDTO;
import com.Backend.services.chat_service.message.service.MessageService;
import com.Backend.services.chat_service.model.DTO.ChatIdOnlyDTO;
import com.Backend.services.friend_service.service.FriendService;
import com.Backend.services.notification_service.model.SimpleNotificationDTO;
import com.Backend.services.notification_service.model.UserIdAndChatId;
import com.Backend.services.notification_service.service.NotificationService;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.services.user_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GlobalEventListener {
    private final FriendService friendService;
    private final SimpMessagingTemplate messagingTemplate;
    private final CacheManager cacheManager;
    private final UserService userService;
    private final NotificationService notificationService;
    private final MessageService messageService;

    @EventListener
    public void onUserStatusChange(UserStatusEvent event) {
        Cache friends = cacheManager.getCache("friends");
        Long userId = userService.getUserIdByEmail(event.email());
        if(friends != null) {
            friends.evict(event.email());
            friends.evict(userId);
        };
        friendService.getAllFriendsReturnASetOfIds(event.email()).forEach(friendId -> {
            if(friends != null && friends.get(friendId) != null) {
                friends.evict(friendId);
            }

            messagingTemplate.convertAndSend(
                    "/topic/friends/status/" + friendId,
                    new StatusNoti(event.email(), event.isOnline())
            );

        });
    }

    @EventListener
    public void onCreatingNotification(SimpleNotificationDTO notification) {
        notificationService.createNotification(
                notification.getUser(),
                notification.getType(),
                notification.getId(),
                notification.getMessage()
        );
    }

    @EventListener
    public void onCreatingNewChat(UserIdAndChatId ids) {
        notificationService.sendNewChatNotification(ids.getUserId(), ids.getChatId());
    }

    @EventListener
    public MessageDTO giveMessageDTO(ChatIdOnlyDTO dto) {
        return messageService.getLatestMessageDTO(dto.getChatId());
    }
}
