package com.Backend.services.friend_service.model;

public record FriendUpdatingBody(
    String email,
    Status status
)
{}
