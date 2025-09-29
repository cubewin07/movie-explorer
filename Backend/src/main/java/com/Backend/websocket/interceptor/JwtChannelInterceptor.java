package com.Backend.websocket.interceptor;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;

import java.util.Objects;
import java.util.Optional;

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

            String jwt = resolveJwt(accessor);
            
            // Validate JWT
            if (jwtService.isTokenExpired(jwt)) {
                throw new RuntimeException("Invalid token");
            }
            
            String attributedUsername = (String) Objects.requireNonNull(accessor.getSessionAttributes()).get("username");
            String username = jwtService.extractUsername(jwt);

            if (attributedUsername != null && !attributedUsername.equals(username)) {
                throw new RuntimeException("Username mismatch");
            }

            accessor.setUser(new UsernamePasswordAuthenticationToken(username, null));
            return message;
        }
        return message;
    }

    private String resolveJwt(StompHeaderAccessor accessor) {
        return Optional.ofNullable(accessor.getFirstNativeHeader("Authorization"))
            .filter(authHeader -> authHeader.startsWith("Bearer "))
            .map(authHeader -> authHeader.substring(7))
            .orElseThrow(() -> new RuntimeException("Missing or invalid Authorization header"));
    }
}
