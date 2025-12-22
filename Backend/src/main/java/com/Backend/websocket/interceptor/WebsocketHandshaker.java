package com.Backend.websocket.interceptor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.MultiValueMap;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.lang.NonNull;



import com.Backend.exception.UserNotFoundException;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.springSecurity.jwtAuthentication.JwtService;

import lombok.RequiredArgsConstructor;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Component
public class WebsocketHandshaker implements HandshakeInterceptor {
    private static final Logger log = LoggerFactory.getLogger(WebsocketHandshaker.class);

    private final UserRepository userRepository;
    private final JwtService jwtService;

    @Override
    public boolean beforeHandshake(
        @NonNull ServerHttpRequest request, 
        @NonNull ServerHttpResponse response,
        @NonNull WebSocketHandler wsHandler,
        @NonNull Map<String, Object> attributes) throws Exception {
        URI uri = request.getURI();

        String jwt = request.getHeaders().getFirst("Authorization");
        if (jwt == null || !jwt.startsWith("Bearer ")) {
            log.warn("WebSocket handshake missing or invalid 'Authorization' header: uri={}", uri);
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }
        jwt = jwt.substring(7); // Remove "Bearer " prefix

        MultiValueMap<String, String> params = UriComponentsBuilder.fromUri(uri).build().getQueryParams();

        List<String> userIds = params.get("userId");
        if (userIds == null || userIds.isEmpty()) {
            log.warn("WebSocket handshake missing 'userId' query parameter: uri={}", uri);
            response.setStatusCode(HttpStatus.BAD_REQUEST);
            return false;
        }
        String userIdStr = userIds.get(0);
        Long userId;
        try {
            userId = Long.valueOf(userIdStr);
        } catch (NumberFormatException nfe) {
            log.warn("WebSocket handshake has non-numeric 'userId': {}", userIdStr);
            response.setStatusCode(HttpStatus.BAD_REQUEST);
            return false;
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new UserNotFoundException("User not found"));

        if(!jwtService.isTokenValid(jwt, user)) {
            log.warn("WebSocket handshake invalid 'Authorization' header: uri={}", uri);
            response.setStatusCode(HttpStatus.UNAUTHORIZED);
            return false;
        }

        attributes.put("email", user.getEmail());
        log.debug("WebSocket handshake accepted for uri={}, userId={}, email set", uri, userId);
        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("WebSocket afterHandshake encountered exception", exception);
        }
    }
}
