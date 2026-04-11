package com.Backend.services.credit_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.service.FilmSyncProcessor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CreditsSyncProcessor implements FilmSyncProcessor {

    private final CreditService creditService;
    private final CreditWeightService creditWeightService;

    @Override
    public SyncCategory getCategory() {
        return SyncCategory.CREDITS;
    }

    @Override
    public boolean isSyncCompleted(Film film) {
        return film != null && Boolean.TRUE.equals(film.getCreditsSyncCompleted());
    }

    @Override
    public void markSyncCompleted(Film film) {
        if (film != null) {
            film.setCreditsSyncCompleted(true);
        }
    }

    @Override
    public void syncForFilm(Long tmdbId, Film film) {
        if (film == null || film.getType() == null) {
            return;
        }
        Long sourceTmdbId = tmdbId != null ? tmdbId : film.getFilmId();
        creditService.syncCreditsForFilm(sourceTmdbId, film.getType(), film);
    }

    @Override
    public void backfillWeightsForFilm(Film film) {
        creditWeightService.backfillWeightsForFilm(film);
    }
}
