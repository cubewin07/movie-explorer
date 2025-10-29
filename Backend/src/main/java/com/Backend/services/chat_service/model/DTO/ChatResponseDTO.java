package com.Backend.services.chat_service.model.DTO;

import java.time.LocalDateTime;
import java.util.Set;

import com.Backend.services.user_service.model.DTO.SimpleUserDTO;
import com.Backend.services.user_service.model.User;

public record ChatResponseDTO(
    Long id, 
    Set<SimpleUserDTO> participants,
    String latestMessageContent, 
    String latestMessageSender, 
    LocalDateTime createdAt
) 
{}
