package com.Backend.services.watchlist_service.controller;

import com.Backend.services.user_service.model.User;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
import com.Backend.services.watchlist_service.model.WatchlistDTO;
import com.Backend.services.watchlist_service.model.WatchlistType;
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
    public ResponseEntity<WatchlistDTO> getWatchlist(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(watchlistService.getWatchlist(user));
    }

    @PostMapping
    public ResponseEntity<Void> addToWatchlist(@RequestBody WatchlistPosting posting, @AuthenticationPrincipal User user) {
        if(posting.type().equals(WatchlistType.MOVIE) || posting.type().equals(WatchlistType.SERIES))
            watchlistService.addToWatchlist(posting, user);
        else
            throw new IllegalArgumentException("Invalid posting type");
        return ResponseEntity.ok().build();
    }
    @DeleteMapping
    public ResponseEntity<Void> deleteFromWatchlist(@RequestBody WatchlistPosting posting, @AuthenticationPrincipal User user) {
        if(posting.type().equals(WatchlistType.MOVIE) || posting.type().equals(WatchlistType.SERIES))
            watchlistService.removeFromWatchlist(posting, user);
        else
            throw new IllegalArgumentException("Invalid posting type");
        return ResponseEntity.ok().build();
    }
}
