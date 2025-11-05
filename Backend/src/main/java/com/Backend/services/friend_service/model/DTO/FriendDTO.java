package com.Backend.services.friend_service.model.DTO;


public record FriendDTO(
    FriendUserDTO user,
    Boolean status
) {}
