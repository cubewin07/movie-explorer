package com.Backend.services.chat_service.model;

import com.Backend.services.chat_service.message.dto.MessageDTO;
import com.Backend.services.chat_service.message.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ChatMessageHelper {
    private final MessageService messageService;

    public MessageDTO getLatestMessageDTO(Long chatId) {
        return messageService.getLatestMessageDTO(chatId);
    }

}
