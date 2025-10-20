package com.Backend.websocket.eventListener;

import com.Backend.services.friend_service.service.FriendService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

import java.security.Principal;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
@RequiredArgsConstructor
public class STOMPEventListener {
    private final Map<String, Set<String>> userSessionMap = new ConcurrentHashMap<>();

    private final SimpMessagingTemplate messagingTemplate;
    private final FriendService friendService;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @EventListener
    public void handleWebSocketConnect(SessionConnectedEvent event) {
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if(principal != null) {
            String username = principal.getName();
            String sessionId = accessor.getSessionId();
            userSessionMap.computeIfAbsent(username, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
            friendService.getAllFriendsReturnASetOfIds(username).forEach(friendId -> {
                messagingTemplate.convertAndSend("topic/status/" + friendId, new StatusNoti(username, "online") );
            });
        }
    }

    @EventListener
    public void handleWebSocketDisconnect(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if(principal != null) {
            String username = principal.getName();
            String sessionId = accessor.getSessionId();
            Set<String> sessions = userSessionMap.get(username);
            if(sessions != null) {
                sessions.remove(sessionId);
                if(sessions.isEmpty()) {
                    userSessionMap.remove(username);
                    scheduler.schedule(() -> {
                        if(!isUserOnline(username)) {
                            friendService.getAllFriendsReturnASetOfIds(username).forEach(friendId -> {
                                messagingTemplate.convertAndSend("topic/status/" + friendId, new StatusNoti(username, "offline") );
                            });
                        }
                    }, 30, TimeUnit.SECONDS);
                }
            }
        }
    }

    public boolean isUserOnline(String username) {
        Set<String> sessions = userSessionMap.get(username);
        return sessions != null && !sessions.isEmpty();
    }

    public Set<String> getSessionIds(String username) {
        return userSessionMap.getOrDefault(username, ConcurrentHashMap.newKeySet());
    }
}