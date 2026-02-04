package com.Backend.services.user_service.model.DTO;

import java.util.List;

import com.Backend.services.notification_service.model.NotificationDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.Backend.services.watchlist_service.model.WatchlistDTO;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserMeDTO {
    private Long id;
    private String email;
    private String username;
    private String role;
    private Boolean isAdmin;

    private WatchlistDTO watchlist;
    private List<NotificationDTO> notifications;
    private List<FriendDTO> requestsFrom;
    private List<FriendDTO> requestsTo;
    private List<ChatSummaryDTO> chats;
}
