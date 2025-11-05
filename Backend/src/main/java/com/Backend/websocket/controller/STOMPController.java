package com.Backend.websocket.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.Backend.services.chat_service.message.service.MessageService;
import com.Backend.services.chat_service.model.ChatLookUpHelper;
import com.Backend.services.chat_service.service.ChatService;
import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.chat_service.message.dto.MessageWebSocketDTO;
import com.Backend.services.notification_service.service.NotificationService;
import com.Backend.services.user_service.model.DTO.SimpleUserDTO;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.exception.UserNotFoundException;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;

import java.security.Principal;

import java.util.Set;
import org.springframework.messaging.handler.annotation.DestinationVariable;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
@Slf4j
public class STOMPController {
    private final SimpMessagingTemplate template;
    private final ChatLookUpHelper chatLookUpHelper;
    private final MessageService messageService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    
    @MessageMapping("/chat/{chatId}/send")
    public void sendMessage(
        @Payload String message, 
        @DestinationVariable Long chatId,
        Principal principal
    ) {
        String email = principal.getName();
        log.info("User {} sent message: {}", email, message);
        User sender = userRepository.findByEmail(email)
            .orElseThrow(() -> new UserNotFoundException("User not found"));
        Message sentMessage = messageService.sendMessage(message, chatId, sender);
        Set<SimpleUserDTO> participants = chatLookUpHelper.getParticipants(chatId);
        String destination = "/topic/chat/" + chatId;
        MessageWebSocketDTO messageDto = MessageWebSocketDTO.fromMessage(sentMessage);
        log.info("Sending WebSocket message to destination: {} with DTO: {}", destination, messageDto);
        template.convertAndSend(destination, messageDto);
        log.info("WebSocket message sent successfully");

        participants.forEach(participant -> {
            if(!participant.getId().equals(sender.getId())) {
                notificationService.createNotificationWithoutSending(participant, "chat", chatId, sentMessage);
            }
        });
    }
}
