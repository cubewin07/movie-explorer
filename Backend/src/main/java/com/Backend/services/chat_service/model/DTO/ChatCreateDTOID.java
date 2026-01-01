package com.Backend.services.chat_service.model.DTO;

import java.util.Set;

public record ChatCreateDTOID(
    Set<Long> userIds
) 
{}
