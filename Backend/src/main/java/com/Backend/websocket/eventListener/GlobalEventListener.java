package com.Backend.websocket.eventListener;

import com.Backend.services.friend_service.service.FriendService;
import com.Backend.services.notification_service.model.SimpleNotificationDTO;
import com.Backend.services.notification_service.model.UserIdAndChatId;
import com.Backend.services.notification_service.service.NotificationService;
import com.Backend.services.user_service.model.UserLookUpHelper;
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
    private final NotificationService notificationService;
    private final UserLookUpHelper userLookUpHelper;

    @EventListener
    public void onUserStatusChange(UserStatusEvent event) {
        Cache friends = cacheManager.getCache("friends");
        Long userId = userLookUpHelper.getUserIdByEmail(event.email());
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
}
