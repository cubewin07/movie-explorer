package com.Backend.services.user_service.model.DTO;

public record AuthenticateDTO(
    String email,
    String password
)
{}
