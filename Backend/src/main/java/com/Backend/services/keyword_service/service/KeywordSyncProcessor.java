package com.Backend.services.keyword_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.service.FilmSyncProcessor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class KeywordSyncProcessor implements FilmSyncProcessor {

    private final KeywordService keywordService;
    private final KeywordWeightService keywordWeightService;

    @Override
    public SyncCategory getCategory() {
        return SyncCategory.KEYWORD;
    }

    @Override
    public boolean isSyncCompleted(Film film) {
        return film != null && Boolean.TRUE.equals(film.getKeywordSyncCompleted());
    }

    @Override
    public void markSyncCompleted(Film film) {
        if (film != null) {
            film.setKeywordSyncCompleted(true);
        }
    }

    @Override
    public void syncForFilm(Long tmdbId, Film film) {
        if (film == null || film.getType() == null) {
            return;
        }
        keywordService.syncKeywordsForFilm(tmdbId, film.getType(), film);
    }

    @Override
    public void backfillWeightsForFilm(Film film) {
        keywordWeightService.backfillWeightsForFilm(film);
    }
}
