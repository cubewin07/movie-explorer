package com.Backend.services.watchlist_service.controller;

import com.Backend.services.user_service.model.User;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/watchlist")
@RequiredArgsConstructor
public class WatchlistController {
    private final WatchlistService watchlistService;

    @GetMapping()
    public ResponseEntity<Watchlist> getWatchlist(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(watchlistService.getWatchlist(user));
    }
    @PostMapping
    public String addMovieToWatchlist() {
        return "Movie added to watchlist";
    }
    @DeleteMapping
    public String deleteMovieFromWatchlist() {
        return "Movie deleted from watchlist";
    }
}
