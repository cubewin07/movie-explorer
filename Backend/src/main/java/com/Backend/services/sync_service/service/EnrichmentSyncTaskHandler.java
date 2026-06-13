package com.Backend.services.sync_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.FilmEnrichmentStatus;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.recommendation_service.repository.RecommendationRepository;
import com.Backend.services.recommendation_service.snapshot.model.RecommendationRecomputeTriggeredBy;
import com.Backend.services.recommendation_service.snapshot.service.UserRecommendationRecomputeTaskService;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.watchlist_service.repository.WatchlistItemRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class EnrichmentSyncTaskHandler implements FilmSyncTaskHandler {

    private final FilmEnrichmentSyncProcessor filmEnrichmentSyncProcessor;
    private final FilmEnrichmentStateService filmEnrichmentStateService;
    private final FilmRepository filmRepository;
    private final RecommendationRepository recommendationRepository;
    private final WatchlistItemRepository watchlistItemRepository;
    private final UserRecommendationRecomputeTaskService recomputeTaskService;

    @Value("${recommendation.enrichment.lease-retry-delay-ms:2000}")
    private long enrichmentLeaseRetryDelayMs;

    public EnrichmentSyncTaskHandler(
            FilmEnrichmentSyncProcessor filmEnrichmentSyncProcessor,
            FilmEnrichmentStateService filmEnrichmentStateService,
            FilmRepository filmRepository,
            RecommendationRepository recommendationRepository,
            WatchlistItemRepository watchlistItemRepository,
            UserRecommendationRecomputeTaskService recomputeTaskService
    ) {
        this.filmEnrichmentSyncProcessor = filmEnrichmentSyncProcessor;
        this.filmEnrichmentStateService = filmEnrichmentStateService;
        this.filmRepository = filmRepository;
        this.recommendationRepository = recommendationRepository;
        this.watchlistItemRepository = watchlistItemRepository;
        this.recomputeTaskService = recomputeTaskService;
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

    /**
     * Called when a userId is available (e.g., triggered from the sync pipeline with user context).
     * Releases the enrichment lease, then — if the film is now fully enriched (DONE) —
     * finds every user whose watchlist contains a source film that recommends this one,
     * and schedules a recommendation recompute for each of them.
     */
    @Override
    public void afterSyncSuccess(Film film, SyncCategory category, Long userId) {
        filmEnrichmentStateService.releaseAfterSuccess(film);

        if (film == null || film.getInternalId() == null) {
            return;
        }

        // Reload to get the latest enrichment status written by releaseAfterSuccess.
        Film reloaded = filmRepository.findById(film.getInternalId()).orElse(null);
        if (reloaded == null || reloaded.getEnrichmentStatus() != FilmEnrichmentStatus.DONE) {
            log.debug(
                    "Skipping recompute trigger after enrichment: film not DONE filmInternalId={}",
                    film.getInternalId()
            );
            return;
        }

        // Find all source films that recommend this newly enriched film.
        List<Long> sourceFilmIds = recommendationRepository
                .findSourceFilmIdsByRecommendedFilmId(reloaded.getInternalId());

        if (sourceFilmIds == null || sourceFilmIds.isEmpty()) {
            log.debug(
                    "No source films found for enriched film filmInternalId={} — skipping recompute trigger",
                    reloaded.getInternalId()
            );
            return;
        }

        // Find all users who have at least one of those source films in their watchlist.
        List<Long> affectedUserIds = watchlistItemRepository.findUserIdsByFilmInternalIds(
                List.copyOf(sourceFilmIds));

        if (affectedUserIds == null || affectedUserIds.isEmpty()) {
            log.debug(
                    "No users found watching source films for enriched film filmInternalId={} — skipping recompute trigger",
                    reloaded.getInternalId()
            );
            return;
        }

        log.info(
                "Enrichment complete for filmInternalId={} — scheduling recompute for {} user(s)",
                reloaded.getInternalId(), affectedUserIds.size()
        );

        for (Long affectedUserId : affectedUserIds) {
            recomputeTaskService.scheduleRecompute(
                    affectedUserId,
                    RecommendationRecomputeTriggeredBy.ENRICHMENT_COMPLETE
            );
        }
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