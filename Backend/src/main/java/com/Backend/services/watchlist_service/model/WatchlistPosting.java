package com.Backend.services.watchlist_service.model;

import com.Backend.services.FilmType;

public record WatchlistPosting(
        FilmType type,
        Long id
)
{}
