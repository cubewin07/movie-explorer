package com.Backend.websocket.eventListener;

import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

import java.security.Principal;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.*;

@Component
@RequiredArgsConstructor
public class STOMPEventListener {
    private final Map<String, Set<String>> userSessionMap = new ConcurrentHashMap<>();
    private final Map<String, ScheduledFuture<?>> offlineTasks = new ConcurrentHashMap<>();

    private final SimpMessagingTemplate messagingTemplate;
    private final ApplicationEventPublisher publisher;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    @EventListener
    public void handleWebSocketConnect(SessionConnectedEvent event) {
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if(principal != null) {
            String username = principal.getName();
            String sessionId = accessor.getSessionId();

            ScheduledFuture<?> task = offlineTasks.get(username);
            if(task != null) task.cancel(false);

            userSessionMap.computeIfAbsent(username, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
            System.out.println(userSessionMap);
            if(userSessionMap.get(username).size() == 1) {
                publisher.publishEvent(new UserStatusEvent(username, true));
            }
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
                    ScheduledFuture<?> future = scheduler.schedule(() -> {
                        if(!isUserOnline(username)) {
                            publisher.publishEvent(new UserStatusEvent(username, false));
                        }
                        offlineTasks.remove(username);
                        System.out.println(userSessionMap);
                    }, 30, TimeUnit.SECONDS);
                    offlineTasks.put(username, future);
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