package com.Backend.services.chat_service.model.DTO;

import java.util.Set;

public record ChatCreateGroupID(
    Set<Long> userIds
) 
{}
