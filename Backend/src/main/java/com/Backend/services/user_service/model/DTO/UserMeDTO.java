package com.Backend.services.user_service.model.DTO;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserMeDTO {
    private Long id;
    private String email;
    private String username;

    private WatchlistDTO watchlist;
    private List<NotificationDTO> notifications;
    private List<FriendDTO> requestsFrom;
    private List<FriendDTO> requestsTo;
    private List<ChatSummaryDTO> chats;
}
