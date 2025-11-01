package com.Backend.services.chat_service.model.DTO;

import java.util.Set;
import com.Backend.services.user_service.model.DTO.SimpleUserDTO;

public record ChatDTO(
    Long id,
    Set<SimpleUserDTO> participants
) {}

