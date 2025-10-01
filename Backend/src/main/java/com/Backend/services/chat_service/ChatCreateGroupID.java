package com.Backend.services.chat_service;

import java.util.Set;

public record ChatCreateGroupID(
    Set<Long> userIds
) 
{}
