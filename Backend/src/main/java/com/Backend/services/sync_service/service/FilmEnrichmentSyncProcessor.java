package com.Backend.services.sync_service.service;

import com.Backend.exception.SyncProcessingException;
import com.Backend.services.credit_service.service.CreditService;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.genre_service.service.GenreService;
import com.Backend.services.keyword_service.service.KeywordService;
import com.Backend.services.sync_service.model.SyncCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class FilmEnrichmentSyncProcessor implements FilmSyncProcessor {

    private final GenreService genreService;
    private final KeywordService keywordService;
    private final CreditService creditService;

    @Override
    public SyncCategory getCategory() {
        return SyncCategory.ENRICHMENT;
    }

    @Override
    public boolean isSyncCompleted(Film film) {
        return film != null
                && Boolean.TRUE.equals(film.getGenreSyncCompleted())
                && Boolean.TRUE.equals(film.getKeywordSyncCompleted())
                && Boolean.TRUE.equals(film.getCreditsSyncCompleted());
    }

    @Override
    public void markSyncCompleted(Film film) {
        // Stage flags are marked immediately after each idempotent stage succeeds so a later retry
        // resumes from the first incomplete stage instead of repeating all TMDB work.
    }

    @Override
    public void syncForFilm(Long tmdbId, Film film) {
        if (film == null || film.getType() == null) {
            throw new SyncProcessingException("FILM_TYPE_MISSING", "Film type is missing for enrichment");
        }

        Long sourceTmdbId = tmdbId != null ? tmdbId : film.getFilmId();
        if (sourceTmdbId == null) {
            throw new SyncProcessingException("TMDB_ID_MISSING", "TMDB id is missing for enrichment");
        }

        if (!Boolean.TRUE.equals(film.getGenreSyncCompleted())) {
            genreService.syncGenresForFilm(sourceTmdbId, film.getType(), film);
            film.setGenreSyncCompleted(true);
        }

        if (!Boolean.TRUE.equals(film.getKeywordSyncCompleted())) {
            keywordService.syncKeywordsForFilm(sourceTmdbId, film.getType(), film);
            film.setKeywordSyncCompleted(true);
        }

        if (!Boolean.TRUE.equals(film.getCreditsSyncCompleted())) {
            creditService.syncCreditsForFilm(sourceTmdbId, film.getType(), film);
            film.setCreditsSyncCompleted(true);
        }
    }

    @Override
    public void backfillWeightsForFilm(Film film) {
        // Recommendation v2 uses shared film enrichment state/snapshots, not per-user weight backfills.
    }
}