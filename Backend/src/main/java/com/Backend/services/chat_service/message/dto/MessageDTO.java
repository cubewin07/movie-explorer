package com.Backend.services.chat_service.message.dto;

import java.time.LocalDateTime;

public record MessageDTO(
    Long id,
    String content,
    Long senderId,
    String senderUsername,
    LocalDateTime createdAt
) {}


