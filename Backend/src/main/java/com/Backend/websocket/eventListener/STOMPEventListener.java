package com.Backend.websocket.eventListener;

import org.springframework.stereotype.Component;
import org.springframework.context.event.EventListener;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;

import java.security.Principal;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class STOMPEventListener {
    private final Map<String, Set<String>> userSessionMap = new ConcurrentHashMap<>();

    @EventListener
    public void handleWebSocketConnect(SessionConnectedEvent event) {
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.wrap(event.getMessage());
        Principal principal = accessor.getUser();
        if(principal != null) {
            String username = principal.getName();
            String sessionId = accessor.getSessionId();
            userSessionMap.computeIfAbsent(username, k -> ConcurrentHashMap.newKeySet()).add(sessionId);
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