package com.Backend.websocket.eventListener;

import com.Backend.services.friend_service.service.FriendService;
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
public class UserStatusEventListener {
    private final FriendService friendService;
    private final SimpMessagingTemplate messagingTemplate;
    private final CacheManager cacheManager;
    private final UserService userService;

    @EventListener
    public void onUserStatusChange(UserStatusEvent event) {
        Cache friends = cacheManager.getCache("friends");
        Long userId = userService.getUserIdByEmail(event.email());
        if(friends != null) {
            friends.evict(event.email());
            friends.evict(userId);
        };
        friendService.getAllFriendsReturnASetOfIds(event.email()).forEach(friendId -> {
            messagingTemplate.convertAndSend(
                    "/topic/friends/status/" + friendId,
                    new StatusNoti(event.email(), event.isOnline())
            );
        });
    }
}
