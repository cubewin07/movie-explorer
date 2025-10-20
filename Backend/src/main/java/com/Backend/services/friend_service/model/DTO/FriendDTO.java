package com.Backend.services.friend_service.model.DTO;

import com.Backend.services.friend_service.model.Status;

public record FriendDTO(
    FriendUserDTO user,
    Boolean status
) {}
