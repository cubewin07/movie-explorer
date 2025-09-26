package com.Backend.services.friend_service.model;

public record FriendDTO(
    FriendUserDTO user1,
    FriendUserDTO user2,
    Status status
) {}
