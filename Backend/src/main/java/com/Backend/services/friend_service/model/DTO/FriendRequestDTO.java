package com.Backend.services.friend_service.model.DTO;

import java.time.LocalDateTime;

import com.Backend.services.friend_service.model.Status;

public record FriendRequestDTO(
        Long id,
        String email,
        String username,
        Status status,
        LocalDateTime createdAt
)
{}
