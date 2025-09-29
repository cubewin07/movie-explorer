package com.Backend.websocket.interceptor;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import lombok.RequiredArgsConstructor;

import com.Backend.exception.UserNotFoundException;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import java.util.Map;

@RequiredArgsConstructor
public class WebsocketHandshaker implements HandshakeInterceptor {
    
    private final UserRepository userRepository;

    @Override
    public boolean beforeHandshake(
        @NonNull ServerHttpRequest request, 
        @NonNull ServerHttpResponse response, 
        @NonNull WebSocketHandler wsHandler, 
        @NonNull Map<String, Object> attributes
    ) throws Exception {
        String uri = request.getURI().toString();
        String userId = uri.split("=")[1];
        User user = userRepository.findById(Long.parseLong(userId)).orElseThrow(() -> new UserNotFoundException("User not found"));
        String username = user.getUsername();
        attributes.put("username", username);
        return true;
    }

    @Override
    public void afterHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response, @NonNull WebSocketHandler wsHandler, @Nullable Exception exception) {
        
    }
}
