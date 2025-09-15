package com.Backend.services.user_service.model;

public record AuthenticateDTO(
    String email,
    String password
)
{}
