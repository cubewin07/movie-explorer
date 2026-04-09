package com.Backend.services.director_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.service.FilmSyncProcessor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DirectorSyncProcessor implements FilmSyncProcessor {

    private final DirectorService directorService;
    private final DirectorWeightService directorWeightService;

    @Override
    public SyncCategory getCategory() {
        return SyncCategory.DIRECTOR;
    }

    @Override
    public boolean isSyncCompleted(Film film) {
        return film != null && Boolean.TRUE.equals(film.getDirectorSyncCompleted());
    }

    @Override
    public void markSyncCompleted(Film film) {
        if (film != null) {
            film.setDirectorSyncCompleted(true);
        }
    }

    @Override
    public void syncForFilm(Long tmdbId, Film film) {
        if (film == null || film.getType() == null) {
            return;
        }
        directorService.syncDirectorsForFilm(tmdbId, film.getType(), film);
    }

    @Override
    public void backfillWeightsForFilm(Film film) {
        directorWeightService.backfillWeightsForFilm(film);
    }
}
