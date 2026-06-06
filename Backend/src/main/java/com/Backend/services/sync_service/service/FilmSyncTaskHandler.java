package com.Backend.services.sync_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.sync_service.model.SyncCategory;
import java.util.Set;

public interface FilmSyncTaskHandler {

    Set<SyncCategory> getSupportedCategories();

    Film prepareFilm(Film film, SyncCategory category);

    boolean isSyncCompleted(Film film, SyncCategory category);

    SyncTaskExecutionGuard beforeSync(Film film, SyncCategory category);

    void syncForFilm(Long tmdbId, Film film, SyncCategory category);

    void markSyncCompleted(Film film, SyncCategory category);

    void afterSyncSuccess(Film film, SyncCategory category);

    void afterSyncFailure(Film film, SyncCategory category);

    void backfillWeightsForFilm(Film film, SyncCategory category);
}