package com.Backend.user_service.model;

public record AuthenticateDTO(
    String email,
    String password
)
{}
