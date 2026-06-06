package com.Backend.services.sync_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.sync_service.model.SyncCategory;
import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class EnrichmentSyncTaskHandler implements FilmSyncTaskHandler {

    private final FilmEnrichmentSyncProcessor filmEnrichmentSyncProcessor;
    private final FilmEnrichmentStateService filmEnrichmentStateService;
    private final FilmRepository filmRepository;

    @Value("${recommendation.enrichment.lease-retry-delay-ms:2000}")
    private long enrichmentLeaseRetryDelayMs;

    public EnrichmentSyncTaskHandler(
            FilmEnrichmentSyncProcessor filmEnrichmentSyncProcessor,
            FilmEnrichmentStateService filmEnrichmentStateService,
            FilmRepository filmRepository
    ) {
        this.filmEnrichmentSyncProcessor = filmEnrichmentSyncProcessor;
        this.filmEnrichmentStateService = filmEnrichmentStateService;
        this.filmRepository = filmRepository;
    }

    @Override
    public Set<SyncCategory> getSupportedCategories() {
        return Set.of(SyncCategory.ENRICHMENT);
    }

    @Override
    public Film prepareFilm(Film film, SyncCategory category) {
        return filmEnrichmentStateService.prepareFilm(film);
    }

    @Override
    public boolean isSyncCompleted(Film film, SyncCategory category) {
        return filmEnrichmentSyncProcessor.isSyncCompleted(film);
    }

    @Override
    public SyncTaskExecutionGuard beforeSync(Film film, SyncCategory category) {
        if (!filmEnrichmentStateService.tryAcquireLease(film)) {
            return SyncTaskExecutionGuard.defer(
                    "ENRICHMENT_LEASE_HELD",
                    "Film enrichment lease is held by another worker",
                    Instant.now().plusMillis(resolveEnrichmentLeaseRetryDelayMs())
            );
        }
        return SyncTaskExecutionGuard.proceed(reloadAfterLeaseClaim(film));
    }

    @Override
    public void syncForFilm(Long tmdbId, Film film, SyncCategory category) {
        filmEnrichmentSyncProcessor.syncForFilm(tmdbId, film);
    }

    @Override
    public void markSyncCompleted(Film film, SyncCategory category) {
        filmEnrichmentSyncProcessor.markSyncCompleted(film);
    }

    @Override
    public void afterSyncSuccess(Film film, SyncCategory category) {
        filmEnrichmentStateService.releaseAfterSuccess(film);
    }

    @Override
    public void afterSyncFailure(Film film, SyncCategory category) {
        filmEnrichmentStateService.releaseAfterFailure(film);
    }

    @Override
    public void backfillWeightsForFilm(Film film, SyncCategory category) {
        filmEnrichmentSyncProcessor.backfillWeightsForFilm(film);
    }

    private Film reloadAfterLeaseClaim(Film film) {
        if (film == null || film.getInternalId() == null) {
            return film;
        }
        Long filmInternalId = Objects.requireNonNull(film.getInternalId());
        return filmRepository.findById(filmInternalId).orElse(null);
    }

    private long resolveEnrichmentLeaseRetryDelayMs() {
        return Math.max(Duration.ofMillis(250).toMillis(), enrichmentLeaseRetryDelayMs);
    }
}