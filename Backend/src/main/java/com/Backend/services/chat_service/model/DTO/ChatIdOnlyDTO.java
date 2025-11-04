package com.Backend.services.chat_service.model.DTO;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatIdOnlyDTO{
    private Long chatId;
}
