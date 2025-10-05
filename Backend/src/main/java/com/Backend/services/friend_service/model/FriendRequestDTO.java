package com.Backend.services.friend_service.model;

import java.time.LocalDateTime;

public record FriendRequestDTO(
        Long id,
        String email,
        Status status,
        LocalDateTime createdAt
)
{}
