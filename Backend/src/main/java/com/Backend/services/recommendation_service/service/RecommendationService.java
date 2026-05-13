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
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClientResponseException;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final String ERROR_CODE_LOCAL_BUDGET_DEFERRED = "LOCAL_BUDGET_DEFERRED";

    private final TmdbClient tmdbClient;
    private final FilmService filmService;
    private final RecommendationRepository recommendationRepository;
    private final PlatformTransactionManager transactionManager;

    @Value("${recommendation.sync.max-similar-per-film:20}")
    private int maxCandidatesPerSource;

    @Value("${recommendation.sync.defer-delay-ms:5000}")
    private long deferDelayMs;

    @Value("${recommendation.filter.cutoff-year:0}")
    private int cutoffYear;

    public List<TmdbSimilarItem> getSimilarAndScheduleRecommendationSync(Long tmdbId, FilmType type) {
        if (tmdbId == null || type == null) {
            return List.of();
        }

        List<TmdbSimilarItem> similarItems = tmdbClient.fetchRecommendations(tmdbId, type);
        return similarItems == null ? List.of() : similarItems;
    }

    /**
     * Phase 1 (v2 plan): ingest TMDB recommendations as candidate edges.
     *
     * <p>Key invariants:
     * <ul>
     *   <li>Filtered: drop candidates with missing/invalid dates; apply cutoff-year.</li>
        *   <li>Bounded: cap to the first N <em>valid</em> candidates after filtering.</li>
     *   <li>Idempotent replace semantics: delete all prior edges for the source and insert the new bounded set
     *       in one transaction.</li>
     * </ul>
     */
    public void syncRecommendationsForFilm(Long tmdbId, Film sourceFilm) {
        if (sourceFilm == null || sourceFilm.getInternalId() == null || sourceFilm.getType() == null) {
            return;
        }

        Long sourceTmdbId = tmdbId != null ? tmdbId : sourceFilm.getFilmId();
        if (sourceTmdbId == null) {
            return;
        }

        if (tmdbClient.getAvailableTokens() < 1.0d) {
            throw localBudgetDefer(
                    ERROR_CODE_LOCAL_BUDGET_DEFERRED,
                    "Insufficient local TMDB budget for recommendations fetch"
            );
        }

        List<TmdbSimilarItem> fetched = fetchRecommendationsOrSkipNotFound(sourceTmdbId, sourceFilm.getType());

        int limit = Math.max(0, maxCandidatesPerSource);
        if (limit == 0) {
            return;
        }

        // Phase A (outside the edge transaction): filter → limit → resolve candidate Film rows.
        // Rationale: the edge transaction is REQUIRES_NEW and should only do delete+insert, with no nested
        // service calls. Candidate film resolution is done per-candidate and failures are skipped.
        List<TmdbSimilarItem> nonNullFetched = fetched == null
            ? List.of()
            : fetched.stream().filter(item -> item != null).toList();

        // Important ordering: cap *valid* candidates, not raw TMDB results.
        List<TmdbSimilarItem> filtered = applyCandidateFilters(nonNullFetched, sourceTmdbId);
        List<TmdbSimilarItem> boundedValidCandidates = filtered.stream().limit(limit).toList();

        List<Long> resolvedCandidateInternalIds = resolveCandidateInternalIds(
            sourceFilm.getInternalId(),
            sourceFilm.getType(),
            sourceTmdbId,
            boundedValidCandidates
        );

        // Phase B (REQUIRES_NEW): pure delete+insert with no external calls.
        replaceEdgesInNewTransaction(sourceFilm.getInternalId(), resolvedCandidateInternalIds);

        log.debug(
                "Ingested recommendation candidates sourceFilmInternalId={} tmdbId={} type={} inserted={}",
                sourceFilm.getInternalId(),
                sourceTmdbId,
                sourceFilm.getType(),
            resolvedCandidateInternalIds.size()
        );
    }

    private List<TmdbSimilarItem> fetchRecommendationsOrSkipNotFound(Long tmdbId, FilmType type) {
        try {
            return tmdbClient.fetchRecommendations(tmdbId, type);
        } catch (WebClientResponseException ex) {
            int status = ex.getStatusCode().value();
            if (status == HttpStatus.NOT_FOUND.value() || status == 422) {
                log.info(
                        "Skipping TMDB recommendations ingestion for missing source tmdbId={} type={} status={}",
                        tmdbId,
                        type,
                        status
                );
                return List.of();
            }
            throw ex;
        }
    }

    private List<TmdbSimilarItem> applyCandidateFilters(List<TmdbSimilarItem> bounded, Long sourceTmdbId) {
        if (bounded == null || bounded.isEmpty()) {
            return List.of();
        }

        int resolvedCutoffYear = Math.max(0, cutoffYear);

        Set<Long> seenTmdbIds = new LinkedHashSet<>();
        List<TmdbSimilarItem> filtered = new ArrayList<>(bounded.size());

        for (TmdbSimilarItem item : bounded) {
            if (item == null || item.tmdbId() == null) {
                continue;
            }
            if (sourceTmdbId != null && item.tmdbId().equals(sourceTmdbId)) {
                continue;
            }
            if (!seenTmdbIds.add(item.tmdbId())) {
                continue;
            }

            String dateValue = item.dateValue();
            if (!StringUtils.hasText(dateValue)) {
                // Plan requirement: drop null release_date/first_air_date; do not treat as unknown year.
                continue;
            }

            Integer year = parseYear(dateValue);
            if (year == null) {
                continue;
            }

            if (resolvedCutoffYear > 0 && year < resolvedCutoffYear) {
                continue;
            }

            filtered.add(item);
        }

        return filtered;
    }

    private Integer parseYear(String dateValue) {
        if (!StringUtils.hasText(dateValue)) {
            return null;
        }
        try {
            return LocalDate.parse(dateValue.trim()).getYear();
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private List<Long> resolveCandidateInternalIds(
            Long sourceFilmInternalId,
            FilmType type,
            Long sourceTmdbId,
            List<TmdbSimilarItem> boundedValidCandidates
    ) {
        if (boundedValidCandidates == null || boundedValidCandidates.isEmpty()) {
            return List.of();
        }

        // Deduplicate by internalId to keep insertion idempotent and stable.
        Set<Long> seenInternalIds = new LinkedHashSet<>();
        List<Long> resolvedInternalIds = new ArrayList<>(boundedValidCandidates.size());

        for (TmdbSimilarItem candidate : boundedValidCandidates) {
            if (candidate == null || candidate.tmdbId() == null) {
                continue;
            }

            try {
                Film candidateFilm = filmService.getOrCreateFilmFromTmdbSnapshot(
                        candidate.tmdbId(),
                        type,
                        candidate.title(),
                        candidate.dateValue(),
                        candidate.backgroundImg()
                );

                Long candidateInternalId = candidateFilm != null ? candidateFilm.getInternalId() : null;
                if (candidateInternalId == null || candidateInternalId.equals(sourceFilmInternalId)) {
                    continue;
                }

                if (seenInternalIds.add(candidateInternalId)) {
                    resolvedInternalIds.add(candidateInternalId);
                }
            } catch (RuntimeException ex) {
                // Per-candidate failure should not abort the whole source film sync.
                log.warn(
                        "Skipping recommendation candidate; failed to resolve Film row sourceInternalId={} sourceTmdbId={} candidateTmdbId={} type={}",
                        sourceFilmInternalId,
                        sourceTmdbId,
                        candidate.tmdbId(),
                        type,
                        ex
                );
            }
        }

        return resolvedInternalIds;
    }

    private void replaceEdgesInNewTransaction(Long sourceFilmInternalId, List<Long> candidateInternalIds) {
        TransactionTemplate requiresNew = new TransactionTemplate(
            Objects.requireNonNull(transactionManager, "transactionManager")
        );
        requiresNew.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);

        requiresNew.executeWithoutResult(status -> {
            recommendationRepository.deleteAllByFilmId(sourceFilmInternalId);

            if (candidateInternalIds == null || candidateInternalIds.isEmpty()) {
                return;
            }

            List<Recommendation> edgesToInsert = new ArrayList<>(candidateInternalIds.size());
            for (Long candidateInternalId : candidateInternalIds) {
                if (candidateInternalId == null || candidateInternalId.equals(sourceFilmInternalId)) {
                    continue;
                }
                edgesToInsert.add(Recommendation.builder()
                        .id(new RecommendationId(sourceFilmInternalId, candidateInternalId))
                        .build());
            }

            if (!edgesToInsert.isEmpty()) {
                recommendationRepository.saveAll(edgesToInsert);
            }
        });
    }

    private LocalBudgetDeferException localBudgetDefer(String errorCode, String message) {
        long delayMs = Math.max(1000L, deferDelayMs);
        return new LocalBudgetDeferException(errorCode, message, Duration.ofMillis(delayMs));
    }
}
