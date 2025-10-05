package com.Backend.services.user_service.model.DTO;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDTO {
    private Long id;
    private String content;
    private SimpleUserDTO sender;
    private boolean read;
    private LocalDateTime createdAt;
}
