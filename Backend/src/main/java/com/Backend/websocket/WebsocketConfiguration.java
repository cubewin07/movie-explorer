package com.Backend.websocket;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.Backend.websocket.interceptor.JwtChannelInterceptor;
import com.Backend.websocket.interceptor.WebsocketHandshaker;

import lombok.RequiredArgsConstructor;

import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.lang.NonNull;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebsocketConfiguration implements WebSocketMessageBrokerConfigurer {

    private final WebsocketHandshaker websocketHandshaker;

    private final JwtChannelInterceptor inboundInterceptor;

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .setHandshakeHandler(handshakeHandler())
                .addInterceptors(websocketHandshaker);
//        .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(@NonNull ChannelRegistration registration) {
        registration.interceptors(inboundInterceptor);
    }

    @Bean
    public DefaultHandshakeHandler handshakeHandler() {
        return new DefaultHandshakeHandler() {
            @Override
            protected Principal determineUser(ServerHttpRequest request,
                                              WebSocketHandler wsHandler,
                                              Map<String, Object> attributes) {
                // attributes["email"] comes from your HandshakeInterceptor
                String email = (String) attributes.get("email");
                if (email == null) {
                    return null;
                }
                // Create a Principal that Spring will use as simpUser
                return new UsernamePasswordAuthenticationToken(email, null, List.of());
            }
        };
    }

}
