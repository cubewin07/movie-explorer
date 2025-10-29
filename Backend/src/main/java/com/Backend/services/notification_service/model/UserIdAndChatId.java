package com.Backend.services.notification_service.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UserIdAndChatId {
    private Long userId;
    private Long chatId;
}
