package com.Backend.websocket.interceptor;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;
import com.Backend.springSecurity.jwtAuthentication.JwtService;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    
    @Override
    public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            var authHeaders = accessor.getNativeHeader("Authorization");

            // Validate Authorization header
            if (authHeaders == null || authHeaders.isEmpty()) {
                throw new RuntimeException("Missing Authorization header");
            }
            String authHeader = authHeaders.get(0);
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("Invalid Authorization header");
            }

            // Validate JWT
            String jwt = authHeader.substring(7);
            if (jwtService.isTokenExpired(jwt)) {
                throw new RuntimeException("Invalid token");
            }

            // Extract username from JWT
            String username = jwtService.extractUsername(jwt);
            accessor.setUser(new UsernamePasswordAuthenticationToken(username, null));
            return message;
        }
        return message;
    }
}
