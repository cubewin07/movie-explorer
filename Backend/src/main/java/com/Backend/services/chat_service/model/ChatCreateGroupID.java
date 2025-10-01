package com.Backend.services.chat_service.model;

import java.util.Set;

public record ChatCreateGroupID(
    Set<Long> userIds
) 
{}
