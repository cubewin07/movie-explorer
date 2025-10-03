package com.Backend.websocket.interceptor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageBuilder;
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
@Slf4j
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
            
            var sessionAttributes = Objects.requireNonNull(accessor.getSessionAttributes());
            String attributedUsername = (String) sessionAttributes.get("email");
            log.info("User with username {} is trying to connect", attributedUsername);

            String usernameFromToken = jwtService.extractUsername(jwt);
            log.info("Username extracted from token: {}", usernameFromToken);

            if (attributedUsername != null && !attributedUsername.equals(usernameFromToken)) {
                throw new RuntimeException("Username mismatch");
            }

            String effectiveUsername = attributedUsername != null ? attributedUsername : usernameFromToken;
            log.info("Effective username: {}", effectiveUsername);
            sessionAttributes.putIfAbsent("email", effectiveUsername);

            accessor.setUser(new UsernamePasswordAuthenticationToken(effectiveUsername, null));
            return message;
        } else {
            if (accessor.getUser() == null) {
                var sessionAttributes = Objects.requireNonNull(accessor.getSessionAttributes());
                String username = (String) sessionAttributes.get("email");
                if (username != null) {
                    log.debug("Restoring user from sessionAttributes: {}", username);
                    accessor.setUser(new UsernamePasswordAuthenticationToken(username, null));
                } else {
                    log.warn("No email found in sessionAttributes for command {}", accessor.getCommand());
                }
            } else {
                log.debug("User already present in accessor: {}", accessor.getUser());
            }
        }
        return MessageBuilder.createMessage(message.getPayload(), accessor.getMessageHeaders());
    }

    private String resolveJwt(StompHeaderAccessor accessor) {
        return Optional.ofNullable(accessor.getFirstNativeHeader("Authorization"))
            .filter(authHeader -> authHeader.startsWith("Bearer "))
            .map(authHeader -> authHeader.substring(7))
            .orElseThrow(() -> new RuntimeException("Missing or invalid Authorization header"));
    }
}
