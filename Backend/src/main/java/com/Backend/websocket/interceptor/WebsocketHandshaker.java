package com.Backend.websocket.interceptor;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;

import java.util.Map;

public class WebsocketHandshaker implements HandshakeInterceptor {
    
    @Override
    public boolean beforeHandshake(
        @NonNull ServerHttpRequest request, 
        @NonNull ServerHttpResponse response, 
        @NonNull WebSocketHandler wsHandler, 
        @NonNull Map<String, Object> attributes
    ) throws Exception {
        String uri = request.getURI().toString();
        String userId = uri.split("=")[1];
        attributes.put("userId", userId);
        return true;
    }

    @Override
    public void afterHandshake(@NonNull ServerHttpRequest request, @NonNull ServerHttpResponse response, @NonNull WebSocketHandler wsHandler, @Nullable Exception exception) {
        
    }
}
