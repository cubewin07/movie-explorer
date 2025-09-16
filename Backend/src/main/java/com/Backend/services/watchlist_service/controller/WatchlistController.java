package com.Backend.services.watchlist_service.controller;

import com.Backend.services.user_service.model.User;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
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
    public ResponseEntity<String> addToWatchlist(@RequestBody WatchlistPosting posting, @AuthenticationPrincipal User user) {
        if(posting.type().equals("movie"))
            watchlistService.addMovieToWatchlist(posting.id(), user);
        else if(posting.type().equals("series"))
            watchlistService.addSeriesToWatchlist(posting.id(), user);
        else
            return ResponseEntity.badRequest().body("Invalid posting type");
        return ResponseEntity.ok().build();
    }
    @DeleteMapping
    public String deleteMovieFromWatchlist() {
        return "Movie deleted from watchlist";
    }
}
