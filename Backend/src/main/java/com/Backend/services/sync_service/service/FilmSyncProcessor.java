package com.Backend.services.sync_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.sync_service.model.SyncCategory;

public interface FilmSyncProcessor {
    SyncCategory getCategory();

    boolean isSyncCompleted(Film film);

    void markSyncCompleted(Film film);

    void syncForFilm(Long tmdbId, Film film);

    void backfillWeightsForFilm(Film film);
}
