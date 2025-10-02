package com.Backend.websocket.controller;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.Backend.services.chat_service.message.service.MessageService;
import com.Backend.services.chat_service.service.ChatService;
import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.notification_service.NotificationService;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.websocket.eventListener.STOMPEventListener;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;

import java.security.Principal;

import java.util.Set;
import org.springframework.messaging.handler.annotation.DestinationVariable;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class STOMPController {
    private final SimpMessagingTemplate template;
    private final ChatService chatService;
    private final MessageService messageService;
    private final STOMPEventListener stompEventListener;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    
    @MessageMapping("/chat/{chatId}/send")
    public void sendMessage(
        @Payload String message, 
        @DestinationVariable Long chatId,
        Principal principal
    ) {
        String username = principal.getName();
        User sender = userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Message sentMessage = messageService.sendMessage(message, chatId, sender);
        Set<User> participants = chatService.getParticipants(chatId);
        String destination = "/topic/chat/" + chatId;
        template.convertAndSend(destination, sentMessage);

        participants.forEach(participant -> {
            if(!participant.getId().equals(sender.getId())) {
                notificationService.createNotificationWithoutSending(participant, "chat", chatId, sentMessage);
            }
        });
    }
}
