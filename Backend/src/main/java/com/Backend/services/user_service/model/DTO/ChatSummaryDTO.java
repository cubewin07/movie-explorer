package com.Backend.services.user_service.model.DTO;

import java.util.List;

import com.Backend.services.chat_service.message.dto.MessageDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatSummaryDTO {
    private Long id;
    private List<SimpleUserDTO> participants;
    private MessageDTO latestMessage;
}
