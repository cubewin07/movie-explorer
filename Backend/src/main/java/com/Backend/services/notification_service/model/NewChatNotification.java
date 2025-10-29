package com.Backend.services.notification_service.model;

import com.Backend.services.chat_service.model.DTO.ChatResponseDTO;

public record NewChatNotification(
        String type,
        ChatResponseDTO chat
)
{}

