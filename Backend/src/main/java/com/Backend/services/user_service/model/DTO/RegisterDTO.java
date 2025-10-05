package com.Backend.services.user_service.model.DTO;

public record RegisterDTO(
    String username,
    String email,
    String password
)
{}
