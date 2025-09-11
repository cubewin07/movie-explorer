package com.Backend.user_service.model;

public record RegisterDTO(
    String username,
    String email,
    String password
)
{}
