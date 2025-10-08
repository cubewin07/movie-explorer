package com.Backend.services.watchlist_service.model;

import java.util.Set;

public record WatchlistDTO(
    Set<Long> moviesId,
    Set<Long> seriesId
) 
{}
