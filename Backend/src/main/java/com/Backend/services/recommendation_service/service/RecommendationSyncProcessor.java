package com.Backend.services.recommendation_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.service.FilmSyncProcessor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class RecommendationSyncProcessor implements FilmSyncProcessor {

    private final RecommendationService recommendationService;

    @Override
    public SyncCategory getCategory() {
        return SyncCategory.RECOMMENDATION;
    }

    @Override
    public boolean isSyncCompleted(Film film) {
        return film != null && Boolean.TRUE.equals(film.getRecommendationSyncCompleted());
    }

    @Override
    public void markSyncCompleted(Film film) {
        if (film != null) {
            film.setRecommendationSyncCompleted(true);
        }
    }

    @Override
    public void syncForFilm(Long tmdbId, Film film) {
        if (film == null || film.getType() == null) {
            return;
        }
        Long sourceTmdbId = tmdbId != null ? tmdbId : film.getFilmId();
        recommendationService.syncRecommendationsForFilm(sourceTmdbId, film);
    }

    @Override
    public void backfillWeightsForFilm(Film film) {
        // No user-weight backfill is required for recommendation linkage ingestion.
    }
}
