package com.Backend.services.sync_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.recommendation_service.service.RecommendationSyncProcessor;
import com.Backend.services.sync_service.model.SyncCategory;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RecommendationSyncTaskHandler implements FilmSyncTaskHandler {

    private final RecommendationSyncProcessor recommendationSyncProcessor;

    @Override
    public Set<SyncCategory> getSupportedCategories() {
        return Set.of(SyncCategory.RECOMMENDATION);
    }

    @Override
    public Film prepareFilm(Film film, SyncCategory category) {
        return film;
    }

    @Override
    public boolean isSyncCompleted(Film film, SyncCategory category) {
        return recommendationSyncProcessor.isSyncCompleted(film);
    }

    @Override
    public SyncTaskExecutionGuard beforeSync(Film film, SyncCategory category) {
        return SyncTaskExecutionGuard.proceed(film);
    }

    @Override
    public void syncForFilm(Long tmdbId, Film film, SyncCategory category) {
        recommendationSyncProcessor.syncForFilm(tmdbId, film);
    }

    @Override
    public void markSyncCompleted(Film film, SyncCategory category) {
        recommendationSyncProcessor.markSyncCompleted(film);
    }

    @Override
    public void afterSyncSuccess(Film film, SyncCategory category) {
        // No recommendation-specific success hook yet.
    }

    @Override
    public void afterSyncFailure(Film film, SyncCategory category) {
        // No recommendation-specific failure hook yet.
    }

    @Override
    public void backfillWeightsForFilm(Film film, SyncCategory category) {
        recommendationSyncProcessor.backfillWeightsForFilm(film);
    }
}