package com.Backend.services.recommendation_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.TmdbSimilarItem;
import com.Backend.services.film_service.service.FilmService;
import com.Backend.services.film_service.service.TmdbClient;
import com.Backend.services.recommendation_service.model.Recommendation;
import com.Backend.services.recommendation_service.model.RecommendationId;
import com.Backend.services.recommendation_service.repository.RecommendationRepository;
import com.Backend.services.sync_service.model.LocalBudgetDeferException;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Collection;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final TmdbClient tmdbClient;
    private final FilmService filmService;
    private final RecommendationRepository recommendationRepository;

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

    public List<TmdbSimilarItem> getSimilarAndScheduleRecommendationSync(Long tmdbId, FilmType type) {
        if (tmdbId == null || type == null) {
            return List.of();
        }

        List<TmdbSimilarItem> similarItems = tmdbClient.fetchSimilar(tmdbId, type);
        if (similarItems == null || similarItems.isEmpty()) {
            return List.of();
        }

        List<TmdbSimilarItem> similarItemsSnapshot = List.copyOf(similarItems);
        long delayMs = Math.max(0L, similarFollowupDelayMs);

        CompletableFuture.runAsync(() -> {
            try {
                Film sourceFilm = filmService.findByTmdbIdAndType(tmdbId, type)
                        .orElseGet(() -> filmService.getOrCreateFilm(tmdbId, type));
                syncRecommendationsFromSimilarItems(tmdbId, sourceFilm, similarItemsSnapshot, 0);
            } catch (LocalBudgetDeferException ex) {
                log.debug("Deferred delayed recommendation sync for tmdbId={} type={} reason={}",
                        tmdbId, type, ex.getMessage());
            } catch (RuntimeException ex) {
                log.warn("Failed delayed recommendation sync for tmdbId={} type={}", tmdbId, type, ex);
            }
        }, CompletableFuture.delayedExecutor(delayMs, TimeUnit.MILLISECONDS));

        return similarItems;
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
        Set<Long> newRecommendationTargets = new LinkedHashSet<>();
        List<Recommendation> recommendationsToInsert = new ArrayList<>();

        for (TmdbSimilarItem similarItem : similarItems) {
            if (recommendationsToInsert.size() >= maxCandidates) {
                break;
            }
            Long candidateTmdbId = similarItem != null ? similarItem.tmdbId() : null;
            if (candidateTmdbId == null || candidateTmdbId.equals(tmdbId)) {
                continue;
            }

            Film existingFilm = filmsByTmdbId.get(candidateTmdbId);
            Long existingFilmInternalId = existingFilm != null ? existingFilm.getInternalId() : null;
            if (existingFilmInternalId != null && existingRecommendationTargets.contains(existingFilmInternalId)) {
                continue;
            }

            Film recommendedFilm = existingFilm;
            boolean hasEnrichedExistingFilm = recommendedFilm != null && recommendedFilm.getRating() != null;

            if (!hasEnrichedExistingFilm) {
                if (requestsUsed >= requestBudget || tmdbClient.getAvailableTokens() < 1.0d) {
                    budgetExhausted = true;
                    break;
                }
                recommendedFilm = filmService.getOrRefreshFilmFromTmdbDetails(candidateTmdbId, sourceFilm.getType());
                requestsUsed++;
                if (recommendedFilm != null && recommendedFilm.getFilmId() != null) {
                    filmsByTmdbId.put(recommendedFilm.getFilmId(), recommendedFilm);
                }

                Long refreshedFilmInternalId = recommendedFilm != null ? recommendedFilm.getInternalId() : null;
                if (refreshedFilmInternalId != null && existingRecommendationTargets.contains(refreshedFilmInternalId)) {
                    continue;
                }
            }

            Long recommendedFilmInternalId = recommendedFilm != null ? recommendedFilm.getInternalId() : null;
            if (recommendedFilmInternalId == null || recommendedFilmInternalId.equals(sourceFilmInternalId)) {
                continue;
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
}
