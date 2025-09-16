package com.Backend.services.watchlist_service.service;

import com.Backend.services.user_service.model.User;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    public Watchlist getWatchlist(User user) {
        return watchlistRepository.findByUserId(user.getId()).orElseThrow();
    }
}
