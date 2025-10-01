package com.Backend.services.chat_service.model;

import java.time.LocalDateTime;
import java.util.Set;

import com.Backend.services.user_service.model.User;

public record ChatResponseDTO(
    Long id, 
    Set<User> participants, 
    String latestMessageContent, 
    String latestMessageSender, 
    LocalDateTime createdAt
) 
{}
