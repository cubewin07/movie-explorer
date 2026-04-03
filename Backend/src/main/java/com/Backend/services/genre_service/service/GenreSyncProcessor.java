package com.Backend.services.genre_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.service.FilmSyncProcessor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GenreSyncProcessor implements FilmSyncProcessor {

    private final GenreService genreService;
    private final GenreWeightService genreWeightService;

    @Override
    public SyncCategory getCategory() {
        return SyncCategory.GENRE;
    }

    @Override
    public boolean isSyncCompleted(Film film) {
        return film != null && Boolean.TRUE.equals(film.getGenreSyncCompleted());
    }

    @Override
    public void markSyncCompleted(Film film) {
        if (film != null) {
            film.setGenreSyncCompleted(true);
        }
    }

    @Override
    public void syncForFilm(Long tmdbId, Film film) {
        if (film == null || film.getType() == null) {
            return;
        }
        genreService.syncGenresForFilm(tmdbId, film.getType(), film);
    }

    @Override
    public void backfillWeightsForFilm(Film film) {
        genreWeightService.backfillWeightsForFilm(film);
    }
}
