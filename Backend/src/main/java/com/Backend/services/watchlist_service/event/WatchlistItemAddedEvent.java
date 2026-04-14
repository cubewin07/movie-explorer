package com.Backend.services.watchlist_service.event;

import com.Backend.services.FilmType;

public record WatchlistItemAddedEvent(
        Long userId,
        Long filmInternalId,
        Long tmdbId,
        FilmType type
) {
}
