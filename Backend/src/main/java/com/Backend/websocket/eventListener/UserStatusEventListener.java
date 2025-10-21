package com.Backend.websocket.eventListener;

import com.Backend.services.friend_service.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserStatusEventListener {
    private final FriendService friendService;
    private final SimpMessagingTemplate messagingTemplate;

    @EventListener
    public void onUserStatusChange(UserStatusEvent event) {
        friendService.getAllFriendsReturnASetOfIds(event.email()).forEach(friendId -> {
            messagingTemplate.convertAndSend(
                    "/topic/friends/status/" + friendId,
                    new StatusNoti(event.email(), event.isOnline())
            );
        });
    }
}
