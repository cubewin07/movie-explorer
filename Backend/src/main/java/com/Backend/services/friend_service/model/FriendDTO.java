package com.Backend.services.friend_service.model;

import com.Backend.services.user_service.model.User;

public record FriendDTO(
    User user,
    Status status
) 
{}
