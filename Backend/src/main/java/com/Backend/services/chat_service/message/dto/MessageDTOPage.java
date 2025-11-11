package com.Backend.services.chat_service.message.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MessageDTOPage {
    private final List<MessageDTO> messages;
    private final Long totalMessagesAcrossAllPage;
}
