package com.Backend.services.recommendation_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.credit_service.repository.FilmRoleRepository;
import com.Backend.services.credit_service.service.CreditService;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.TmdbSimilarItem;
import com.Backend.services.film_service.service.FilmService;
import com.Backend.services.film_service.service.TmdbClient;
import com.Backend.services.genre_service.repository.GenreRepository;
import com.Backend.services.genre_service.service.GenreService;
import com.Backend.services.keyword_service.repository.KeywordRepository;
import com.Backend.services.keyword_service.service.KeywordService;
import com.Backend.services.recommendation_service.model.Recommendation;
import com.Backend.services.recommendation_service.model.RecommendationId;
import com.Backend.services.recommendation_service.repository.RecommendationRepository;
import com.Backend.services.sync_service.model.LocalBudgetDeferException;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final TmdbClient tmdbClient;
    private final FilmService filmService;
    private final CreditService creditService;
    private final KeywordService keywordService;
    private final GenreService genreService;
    private final FilmRoleRepository filmRoleRepository;
    private final KeywordRepository keywordRepository;
    private final GenreRepository genreRepository;
    private final RecommendationRepository recommendationRepository;
    private final TransactionTemplate transactionTemplate;
    private final TaskScheduler taskScheduler;

    @Value("${recommendation.sync.max-similar-per-film:20}")
    private int maxSimilarPerFilm;

    @Value("${recommendation.sync.max-requests-per-run:8}")
    private int maxRequestsPerRun;

    @Value("${recommendation.sync.defer-delay-ms:5000}")
    private long deferDelayMs;

    @Value("${recommendation.sync.allow-partial-bootstrap:true}")
    private boolean allowPartialBootstrap;

    @Value("${recommendation.sync.similar-followup-delay-ms:10000}")
    private long similarFollowupDelayMs;

    @Value("${recommendation.sync.similar-followup-enabled:true}")
    private boolean similarFollowupEnabled;

    public List<TmdbSimilarItem> getSimilarAndScheduleRecommendationSync(Long tmdbId, FilmType type) {
        if (tmdbId == null || type == null) {
            return List.of();
        }

        List<TmdbSimilarItem> similarItems = tmdbClient.fetchSimilar(tmdbId, type);
        if (similarItems == null || similarItems.isEmpty()) {
            return List.of();
        }

        if (!similarFollowupEnabled) {
            return similarItems;
        }

        List<TmdbSimilarItem> similarItemsSnapshot = List.copyOf(similarItems);
        long delayMs = Math.max(0L, similarFollowupDelayMs);

        taskScheduler.schedule(
                () -> runDelayedRecommendationSync(tmdbId, type, similarItemsSnapshot),
            Objects.requireNonNull(Instant.now().plusMillis(delayMs))
        );

        return similarItems;
    }

    private void runDelayedRecommendationSync(Long tmdbId, FilmType type, List<TmdbSimilarItem> similarItemsSnapshot) {
        try {
            LocalBudgetDeferException deferred = runSnapshotSyncInTransaction(tmdbId, type, similarItemsSnapshot);
            if (deferred != null) {
                log.debug("Deferred delayed recommendation sync for tmdbId={} type={} reason={}",
                        tmdbId, type, deferred.getMessage());
            }
        } catch (RuntimeException ex) {
            log.warn("Failed delayed recommendation sync for tmdbId={} type={}", tmdbId, type, ex);
        }
    }

    @Transactional(noRollbackFor = LocalBudgetDeferException.class)
    public void syncRecommendationsForFilm(Long tmdbId, Film sourceFilm) {
        if (sourceFilm == null || sourceFilm.getInternalId() == null || sourceFilm.getType() == null || tmdbId == null) {
            return;
        }

        if (tmdbClient.getAvailableTokens() < 1.0d) {
            throw localBudgetDefer(
                    "LOCAL_BUDGET_DEFERRED",
                    "Insufficient local TMDB budget for similar fetch"
            );
        }

        List<TmdbSimilarItem> similarItems = tmdbClient.fetchSimilar(tmdbId, sourceFilm.getType());
        if (similarItems == null || similarItems.isEmpty()) {
            return;
        }

        syncRecommendationsFromSimilarItems(tmdbId, sourceFilm, similarItems, 1);
    }

    private void syncRecommendationsFromSimilarItems(
            Long tmdbId,
            Film sourceFilm,
            List<TmdbSimilarItem> similarItems,
            int initialRequestsUsed
    ) {
        if (sourceFilm == null || sourceFilm.getInternalId() == null || sourceFilm.getType() == null || tmdbId == null) {
            return;
        }

        int maxCandidates = Math.max(0, maxSimilarPerFilm);
        if (maxCandidates == 0 || similarItems == null || similarItems.isEmpty()) {
            return;
        }

        int requestBudget = Math.max(1, maxRequestsPerRun);

        Long sourceFilmInternalId = sourceFilm.getInternalId();
        Set<Long> candidateTmdbIds = similarItems.stream()
                .filter(Objects::nonNull)
                .map(TmdbSimilarItem::tmdbId)
                .filter(Objects::nonNull)
                .filter(candidateTmdbId -> !candidateTmdbId.equals(tmdbId))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Map<Long, Film> filmsByTmdbId = new HashMap<>();
        for (Film existingFilm : filmService.findByTmdbIdsAndType(candidateTmdbIds, sourceFilm.getType())) {
            if (existingFilm != null && existingFilm.getFilmId() != null) {
                filmsByTmdbId.put(existingFilm.getFilmId(), existingFilm);
            }
        }

        Set<Long> existingRecommendationTargets = loadExistingRecommendationTargets(
                sourceFilmInternalId,
                filmsByTmdbId.values()
        );

        int requestsUsed = Math.max(0, initialRequestsUsed);
        boolean budgetExhausted = false;
        int processedCandidates = 0;
        Set<Long> newRecommendationTargets = new LinkedHashSet<>();
        List<Recommendation> recommendationsToInsert = new ArrayList<>();

        for (TmdbSimilarItem similarItem : similarItems) {
            if (processedCandidates >= maxCandidates) {
                break;
            }
            Long candidateTmdbId = similarItem != null ? similarItem.tmdbId() : null;
            if (candidateTmdbId == null || candidateTmdbId.equals(tmdbId)) {
                continue;
            }
            processedCandidates++;

            Film existingFilm = filmsByTmdbId.get(candidateTmdbId);
            Long existingFilmInternalId = existingFilm != null ? existingFilm.getInternalId() : null;
            if (existingFilmInternalId != null && existingRecommendationTargets.contains(existingFilmInternalId)) {
                continue;
            }

            Film recommendedFilm = existingFilm;
            boolean hasEnrichedExistingFilm = recommendedFilm != null && recommendedFilm.getRating() != null;

            if (!hasEnrichedExistingFilm) {
                if (isBudgetExhausted(requestsUsed, requestBudget)) {
                    budgetExhausted = true;
                    break;
                }
                recommendedFilm = filmService.getOrRefreshFilmFromTmdbDetails(candidateTmdbId, sourceFilm.getType());
                requestsUsed++;
                if (recommendedFilm != null && recommendedFilm.getFilmId() != null) {
                    filmsByTmdbId.put(recommendedFilm.getFilmId(), recommendedFilm);
                }
            }

            Long recommendedFilmInternalId = recommendedFilm != null ? recommendedFilm.getInternalId() : null;
            if (recommendedFilmInternalId == null || recommendedFilmInternalId.equals(sourceFilmInternalId)) {
                continue;
            }

            MetadataEnrichmentProgress enrichmentProgress = enrichCandidateMetadataIfNeeded(
                    recommendedFilm,
                    candidateTmdbId,
                    sourceFilm.getType(),
                    requestsUsed,
                    requestBudget
            );
            requestsUsed = enrichmentProgress.requestsUsed();
            if (enrichmentProgress.budgetExhausted()) {
                budgetExhausted = true;
                log.debug(
                        "Stopped recommendation candidate enrichment due to local TMDB budget filmInternalId={} tmdbId={} candidateTmdbId={} reason={}",
                        sourceFilmInternalId,
                        tmdbId,
                        candidateTmdbId,
                        enrichmentProgress.reason()
                );
                break;
            }

            if (existingRecommendationTargets.contains(recommendedFilmInternalId)) {
                continue;
            }
            if (!newRecommendationTargets.add(recommendedFilmInternalId)) {
                continue;
            }

            recommendationsToInsert.add(Recommendation.builder()
                    .id(new RecommendationId(sourceFilmInternalId, recommendedFilmInternalId))
                    .build());
        }

        if (budgetExhausted && !allowPartialBootstrap) {
            throw localBudgetDefer(
                    "LOCAL_BUDGET_DEFERRED",
                    "Deferred recommendation refresh due to local TMDB budget (partial disabled)"
            );
        }

        int savedCount = 0;
        if (!recommendationsToInsert.isEmpty()) {
            recommendationRepository.saveAll(recommendationsToInsert);
            savedCount = recommendationsToInsert.size();
        }

        log.debug("Synced {} recommendations for film internalId={} tmdbId={} requestsUsed={} budget={} budgetExhausted={}",
                savedCount, sourceFilm.getInternalId(), tmdbId, requestsUsed, requestBudget, budgetExhausted);

        if (budgetExhausted) {
            throw localBudgetDefer(
                    "LOCAL_BUDGET_DEFERRED",
                    "Stored partial bootstrap recommendations due to local TMDB budget"
            );
        }
    }

    private LocalBudgetDeferException localBudgetDefer(String errorCode, String message) {
        long delayMs = Math.max(1000L, deferDelayMs);
        return new LocalBudgetDeferException(errorCode, message, Duration.ofMillis(delayMs));
    }

    private Set<Long> loadExistingRecommendationTargets(Long sourceFilmInternalId, Collection<Film> films) {
        if (sourceFilmInternalId == null || films == null || films.isEmpty()) {
            return Set.of();
        }

        Set<Long> candidateInternalIds = films.stream()
                .filter(Objects::nonNull)
                .map(Film::getInternalId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        if (candidateInternalIds.isEmpty()) {
            return Set.of();
        }

        return recommendationRepository.findExistingRecommendedFilmIds(sourceFilmInternalId, candidateInternalIds);
    }

    private LocalBudgetDeferException runSnapshotSyncInTransaction(
            Long tmdbId,
            FilmType type,
            List<TmdbSimilarItem> similarItemsSnapshot
    ) {
        AtomicReference<LocalBudgetDeferException> deferred = new AtomicReference<>();
        transactionTemplate.executeWithoutResult(status -> {
            try {
                Film sourceFilm = filmService.findByTmdbIdAndType(tmdbId, type)
                        .orElseGet(() -> filmService.getOrCreateFilm(tmdbId, type));
                syncRecommendationsFromSimilarItems(tmdbId, sourceFilm, similarItemsSnapshot, 0);
            } catch (LocalBudgetDeferException ex) {
                // Keep partial inserts and sync-complete flag updates committed in delayed path.
                deferred.set(ex);
            }
        });
        return deferred.get();
    }

    private MetadataEnrichmentProgress enrichCandidateMetadataIfNeeded(
            Film candidateFilm,
            Long candidateTmdbId,
            FilmType type,
            int requestsUsed,
            int requestBudget
    ) {
        if (candidateFilm == null || candidateFilm.getInternalId() == null || candidateTmdbId == null || type == null) {
            return MetadataEnrichmentProgress.continueWith(requestsUsed);
        }

        MetadataSyncState creditsState = resolveCreditsState(candidateFilm);
        if (creditsState == MetadataSyncState.POPULATED_STALE) {
            candidateFilm.setCreditsSyncCompleted(true);
        } else if (creditsState == MetadataSyncState.MISSING) {
            if (isBudgetExhausted(requestsUsed, requestBudget)) {
                return MetadataEnrichmentProgress.exhausted(requestsUsed, "CREDITS");
            }
            creditService.syncCreditsForFilm(candidateTmdbId, type, candidateFilm);
            candidateFilm.setCreditsSyncCompleted(true);
            requestsUsed++;
        }

        MetadataSyncState keywordState = resolveKeywordState(candidateFilm);
        if (keywordState == MetadataSyncState.POPULATED_STALE) {
            candidateFilm.setKeywordSyncCompleted(true);
        } else if (keywordState == MetadataSyncState.MISSING) {
            if (isBudgetExhausted(requestsUsed, requestBudget)) {
                return MetadataEnrichmentProgress.exhausted(requestsUsed, "KEYWORD");
            }
            keywordService.syncKeywordsForFilm(candidateTmdbId, type, candidateFilm);
            candidateFilm.setKeywordSyncCompleted(true);
            requestsUsed++;
        }

        MetadataSyncState genreState = resolveGenreState(candidateFilm);
        if (genreState == MetadataSyncState.POPULATED_STALE) {
            candidateFilm.setGenreSyncCompleted(true);
        } else if (genreState == MetadataSyncState.MISSING) {
            if (isBudgetExhausted(requestsUsed, requestBudget)) {
                return MetadataEnrichmentProgress.exhausted(requestsUsed, "GENRE");
            }
            genreService.syncGenresForFilm(candidateTmdbId, type, candidateFilm);
            candidateFilm.setGenreSyncCompleted(true);
            requestsUsed++;
        }

        return MetadataEnrichmentProgress.continueWith(requestsUsed);
    }

    private MetadataSyncState resolveCreditsState(Film candidateFilm) {
        if (candidateFilm == null) {
            return MetadataSyncState.MISSING;
        }
        if (Boolean.TRUE.equals(candidateFilm.getCreditsSyncCompleted())) {
            return MetadataSyncState.COMPLETE;
        }
        Long filmInternalId = candidateFilm.getInternalId();
        if (filmInternalId != null && filmRoleRepository.existsByFilm_InternalId(filmInternalId)) {
            return MetadataSyncState.POPULATED_STALE;
        }
        return MetadataSyncState.MISSING;
    }

    private MetadataSyncState resolveKeywordState(Film candidateFilm) {
        if (candidateFilm == null) {
            return MetadataSyncState.MISSING;
        }
        if (Boolean.TRUE.equals(candidateFilm.getKeywordSyncCompleted())) {
            return MetadataSyncState.COMPLETE;
        }
        Long filmInternalId = candidateFilm.getInternalId();
        if (filmInternalId != null && keywordRepository.existsByFilms_InternalId(filmInternalId)) {
            return MetadataSyncState.POPULATED_STALE;
        }
        return MetadataSyncState.MISSING;
    }

    private MetadataSyncState resolveGenreState(Film candidateFilm) {
        if (candidateFilm == null) {
            return MetadataSyncState.MISSING;
        }
        if (Boolean.TRUE.equals(candidateFilm.getGenreSyncCompleted())) {
            return MetadataSyncState.COMPLETE;
        }
        Long filmInternalId = candidateFilm.getInternalId();
        if (filmInternalId != null && genreRepository.existsByFilms_InternalId(filmInternalId)) {
            return MetadataSyncState.POPULATED_STALE;
        }
        return MetadataSyncState.MISSING;
    }

    private boolean isBudgetExhausted(int requestsUsed, int requestBudget) {
        return requestsUsed >= requestBudget || tmdbClient.getAvailableTokens() < 1.0d;
    }

    private enum MetadataSyncState {
        COMPLETE,
        POPULATED_STALE,
        MISSING
    }

    private record MetadataEnrichmentProgress(int requestsUsed, boolean budgetExhausted, String reason) {
        private static MetadataEnrichmentProgress continueWith(int requestsUsed) {
            return new MetadataEnrichmentProgress(requestsUsed, false, null);
        }

        private static MetadataEnrichmentProgress exhausted(int requestsUsed, String reason) {
            return new MetadataEnrichmentProgress(requestsUsed, true, reason);
        }
    }
}
