package com.Backend.services.recommendation_service.snapshot.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.FilmEnrichmentStatus;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.recommendation_service.repository.RecommendationRepository;
import com.Backend.services.watchlist_service.repository.WatchlistItemRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/**
 * Responsible for two distinct pass-1 candidate selection modes:
 *
 * <ul>
 *   <li>{@link #pickEnrichedSurvivors} — used by the recompute pipeline. Only selects
 *       candidates whose enrichment status is {@code DONE}, so the snapshot always
 *       contains quality data.</li>
 *   <li>{@link #getPass2SurvivorsForEnrichment} — used by {@code RecommendationSyncTaskHandler}
 *       to decide which placeholder candidates are worth sending to the enrichment
 *       pipeline. Runs the same cheap heuristic but without the enrichment filter,
 *       because non-enriched films can still qualify via language/rating values
 *       already seeded from the TMDB snapshot.</li>
 * </ul>
 *
 * Both modes share {@link #resolveWatchlistFilmIds} and {@link #resolveCandidateFilmIds}
 * for candidate pool construction.
 */
@Service
@RequiredArgsConstructor
public class CandidatePassFilter {

    private final WatchlistItemRepository watchlistItemRepository;
    private final RecommendationRepository recommendationRepository;
    private final FilmRepository filmRepository;

    @Value("${recommendation.recompute.max-watchlist-items:200}")
    private int maxWatchlistItems;

    @Value("${recommendation.recompute.max-candidates-per-user:200}")
    private int maxCandidatesPerUser;

    @Value("${recommendation.recompute.pass2.top-k:60}")
    private int pass2TopK;

    @Value("${recommendation.scoring.new-release-days:365}")
    private int newReleaseDays;

    @Value("${recommendation.scoring.new-release-boost:0.5}")
    private double newReleaseBoost;

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    /**
     * Resolves the watchlist film IDs for a user, capped at {@code max-watchlist-items}.
     */
    public List<Long> resolveWatchlistFilmIds(long userId) {
        List<Long> ids = watchlistItemRepository.findFilmInternalIdsByUserId(userId);
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }
        int limit = Math.max(0, maxWatchlistItems);
        return (limit > 0
                ? ids.stream().filter(Objects::nonNull).sorted().limit(limit)
                : ids.stream().filter(Objects::nonNull).sorted())
                .toList();
    }

    /**
     * Resolves the candidate film IDs for a given watchlist, excluding films already
     * in the watchlist and capped at {@code max-candidates-per-user}.
     */
    public Set<Long> resolveCandidateFilmIds(List<Long> watchlistFilmIds) {
        if (watchlistFilmIds == null || watchlistFilmIds.isEmpty()) {
            return Set.of();
        }

        int resolvedMax = Math.max(0, maxCandidatesPerUser);
        Set<Long> watchlistSet = new HashSet<>(watchlistFilmIds);

        List<Long> raw = resolvedMax > 0
                ? recommendationRepository.findRecommendedFilmIdsByFilmIdsLimited(
                        watchlistSet, PageRequest.of(0, resolvedMax))
                : new ArrayList<>(recommendationRepository.findRecommendedFilmIdsByFilmIds(watchlistSet));

        if (raw == null || raw.isEmpty()) {
            return Set.of();
        }

        Set<Long> candidates = new LinkedHashSet<>();
        for (Long id : raw) {
            if (id != null && !watchlistSet.contains(id)) {
                candidates.add(id);
            }
        }
        return candidates;
    }

    /**
     * Pass-1 survivor selection for the <b>recompute pipeline</b>.
     * Only {@code DONE}-enriched candidates are considered; returns the top-k by
     * cheap heuristic (language match + rating + recency).
     */
    public List<Long> pickEnrichedSurvivors(List<Long> watchlistFilmIds, Set<Long> candidateIds) {
        return pickSurvivors(watchlistFilmIds, candidateIds, true);
    }

    /**
     * Pass-1 survivor selection for the <b>enrichment pipeline</b>.
     * All candidates are scored regardless of enrichment status — non-enriched
     * placeholder films can qualify via the language/rating values seeded from
     * the TMDB snapshot. Returns the top-k by the same cheap heuristic.
     */
    public List<Long> pickEnrichmentCandidates(List<Long> watchlistFilmIds, Set<Long> candidateIds) {
        return pickSurvivors(watchlistFilmIds, candidateIds, false);
    }

    /**
     * Convenience entry point for {@code RecommendationSyncTaskHandler}: resolves
     * watchlist → candidate pool → pass-1 without enrichment filter for a given user.
     */
    public List<Long> getPass2SurvivorsForEnrichment(Long userId) {
        if (userId == null) {
            return List.of();
        }
        List<Long> watchlistFilmIds = resolveWatchlistFilmIds(userId);
        if (watchlistFilmIds.isEmpty()) {
            return List.of();
        }
        Set<Long> candidateIds = resolveCandidateFilmIds(watchlistFilmIds);
        return pickEnrichmentCandidates(watchlistFilmIds, candidateIds);
    }

    /**
     * Shared recency-boost computation used by both pass-1 modes and the full scorer.
     */
    public double computeRecencyBoost(LocalDate date) {
        if (date == null) {
            return 0.0d;
        }
        int windowDays = Math.max(1, newReleaseDays);
        double boost = Math.max(0.0d, newReleaseBoost);
        LocalDate threshold = LocalDate.now().minusDays(windowDays);
        return date.isBefore(threshold) ? 0.0d : boost;
    }

    // -------------------------------------------------------------------------
    // Shared helpers (package-visible so RecommendationSnapshotRecomputeService
    // can call them without duplicating logic)
    // -------------------------------------------------------------------------

    public String normalizeLanguage(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return normalized.isEmpty() ? null : normalized;
    }

    public double safeDouble(Double value) {
        return value == null ? 0.0d : value;
    }

    // -------------------------------------------------------------------------
    // Internal
    // -------------------------------------------------------------------------

    private List<Long> pickSurvivors(
            List<Long> watchlistFilmIds,
            Set<Long> candidateIds,
            boolean onlyEnriched
    ) {
        int k = Math.max(0, pass2TopK);
        if (k == 0 || candidateIds == null || candidateIds.isEmpty()) {
            return List.of();
        }

        Set<String> watchlistLanguages = buildWatchlistLanguages(watchlistFilmIds);

        List<Film> candidates = filmRepository.findAllById(candidateIds);
        if (candidates == null || candidates.isEmpty()) {
            return List.of();
        }

        List<Pass1ScoredId> scored = new ArrayList<>(candidates.size());
        for (Film candidate : candidates) {
            if (candidate == null || candidate.getInternalId() == null) {
                continue;
            }
            if (onlyEnriched && candidate.getEnrichmentStatus() != FilmEnrichmentStatus.DONE) {
                continue;
            }
            double languageRaw = watchlistLanguages.contains(normalizeLanguage(candidate.getOriginalLanguage())) ? 1.0d : 0.0d;
            double ratingRaw = safeDouble(candidate.getRating());
            double recency = computeRecencyBoost(candidate.getDate());
            double score = languageRaw * 1.0d + ratingRaw * 0.01d + recency;
            scored.add(new Pass1ScoredId(candidate.getInternalId(), score));
        }

        scored.sort(Comparator
                .comparingDouble(Pass1ScoredId::score).reversed()
                .thenComparing(Pass1ScoredId::internalFilmId));

        return scored.stream().limit(k).map(Pass1ScoredId::internalFilmId).toList();
    }

    private Set<String> buildWatchlistLanguages(List<Long> watchlistFilmIds) {
        if (watchlistFilmIds == null || watchlistFilmIds.isEmpty()) {
            return Set.of();
        }
        Set<String> languages = new HashSet<>();
        for (Film film : filmRepository.findAllById(watchlistFilmIds)) {
            if (film == null) {
                continue;
            }
            String lang = normalizeLanguage(film.getOriginalLanguage());
            if (lang != null) {
                languages.add(lang);
            }
        }
        return languages;
    }

    // -------------------------------------------------------------------------
    // Internal record
    // -------------------------------------------------------------------------

    record Pass1ScoredId(Long internalFilmId, double score) {
    }
}
