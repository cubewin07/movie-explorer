package com.Backend.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import com.Backend.websocket.interceptor.WebsocketHandshaker;

import lombok.RequiredArgsConstructor;

import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.lang.NonNull;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebsocketConfiguration implements WebSocketMessageBrokerConfigurer {

    private final WebsocketHandshaker websocketHandshaker;
    
    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
        .setAllowedOrigins("*")
        .addInterceptors(websocketHandshaker)
        .withSockJS();
    }
    

    
}
