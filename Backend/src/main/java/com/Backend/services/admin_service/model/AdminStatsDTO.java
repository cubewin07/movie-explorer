package com.Backend.services.admin_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminStatsDTO {
    private long usersTotal;
    private long adminsTotal;
    private long chatsTotal;
    private long messagesTotal;
    private long friendshipsAccepted;
    private long friendshipsPending;
    private long reviewsTotal;
    private long reviewsRepliesTotal;
    private long watchlistedMoviesTotal;
    private long watchlistedSeriesTotal;
    private int onlineUsers;
}
