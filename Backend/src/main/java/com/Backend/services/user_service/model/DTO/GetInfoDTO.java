package com.Backend.services.user_service.model.DTO;

import com.Backend.services.friend_service.model.Status;
import com.Backend.services.watchlist_service.model.WatchlistDTO;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@AllArgsConstructor
@Builder
public class GetInfoDTO {
    private Long id;
    private String username;
    private String email;
    private WatchlistDTO watchlist;
    private Status status;
}
