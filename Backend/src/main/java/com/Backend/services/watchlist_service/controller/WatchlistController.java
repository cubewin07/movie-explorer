package com.Backend.services.watchlist_service.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/watchlist")
public class WatchlistController {
    @GetMapping()
    public String getWatchlist() {
        return "Watchlist";
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
