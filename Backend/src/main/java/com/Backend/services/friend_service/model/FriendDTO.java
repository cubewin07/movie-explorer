package com.Backend.services.friend_service.model;

public record FriendDTO(
    FriendUserDTO user,
    Status status
) {}
