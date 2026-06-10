package com.Backend.services.sync_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.FilmEnrichmentStatus;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.recommendation_service.repository.RecommendationRepository;
import com.Backend.services.recommendation_service.snapshot.model.RecommendationRecomputeTriggeredBy;
import com.Backend.services.recommendation_service.snapshot.service.CandidatePassFilter;
import com.Backend.services.recommendation_service.snapshot.service.UserRecommendationRecomputeTaskService;
import com.Backend.services.recommendation_service.service.RecommendationSyncProcessor;
import com.Backend.services.sync_service.helper.SyncTaskHelper;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.model.SyncTask;
import com.Backend.services.sync_service.model.SyncTaskStatus;
import com.Backend.services.sync_service.repository.SyncTaskRepository;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class RecommendationSyncTaskHandler implements FilmSyncTaskHandler {

    private final RecommendationSyncProcessor recommendationSyncProcessor;
    private final UserRecommendationRecomputeTaskService recomputeTaskService;
    private final CandidatePassFilter candidatePassFilter;
    private final RecommendationRepository recommendationRepository;
    private final FilmRepository filmRepository;
    private final SyncTaskRepository syncTaskRepository;
    private final SyncTaskHelper syncTaskHelper;

    @Value("${recommendation.enrichment.max-candidates-per-sync:${recommendation.sync.max-similar-per-film:20}}")
    private int recommendationEnrichmentMaxCandidatesPerSync;

    @Value("${recommendation.recompute.min-enriched-survivors:3}")
    private int minEnrichedSurvivorsForRecompute;

    @Override
    public Set<SyncCategory> getSupportedCategories() {
        return Set.of(SyncCategory.RECOMMENDATION);
    }

    @Override
    public Film prepareFilm(Film film, SyncCategory category) {
        return film;
    }

    @Override
    public boolean isSyncCompleted(Film film, SyncCategory category) {
        return recommendationSyncProcessor.isSyncCompleted(film);
    }

    @Override
    public SyncTaskExecutionGuard beforeSync(Film film, SyncCategory category) {
        return SyncTaskExecutionGuard.proceed(film);
    }

    @Override
    public void syncForFilm(Long tmdbId, Film film, SyncCategory category) {
        recommendationSyncProcessor.syncForFilm(tmdbId, film);
    }

    @Override
    public void markSyncCompleted(Film film, SyncCategory category) {
        recommendationSyncProcessor.markSyncCompleted(film);
    }

    @Override
    public void afterSyncSuccess(Film film, SyncCategory category) {
        afterSyncSuccess(film, category, null);
    }

    @Override
    public void afterSyncSuccess(Film film, SyncCategory category, Long userId) {
        enqueueCandidateEnrichmentAfterRecommendationSync(film, category, userId);

        if (userId == null) {
            log.debug(
                    "Skipping recommendation recompute scheduling after sync success because userId is missing filmInternalId={}",
                    film != null ? film.getInternalId() : null
            );
            return;
        }

        // Only trigger an immediate recompute if enough survivors are already enriched.
        // When most candidates are still pending enrichment the recompute would produce
        // low-quality results, so we defer until EnrichmentSyncTaskHandler fires it.
        List<Long> survivors = candidatePassFilter.getPass2SurvivorsForEnrichment(userId);
        long enrichedCount = survivors.stream()
                .map(filmRepository::findById)
                .filter(opt -> opt.isPresent()
                        && opt.get().getEnrichmentStatus() == FilmEnrichmentStatus.DONE)
                .count();

        int threshold = Math.max(1, minEnrichedSurvivorsForRecompute);
        if (enrichedCount >= threshold) {
            recomputeTaskService.scheduleRecompute(
                    userId,
                    RecommendationRecomputeTriggeredBy.RECOMMENDATION_SYNC_COMPLETE
            );
        } else {
            log.debug(
                    "Skipping recompute after recommendation sync: only {}/{} survivors are enriched (threshold={}) userId={}",
                    enrichedCount, survivors.size(), threshold, userId
            );
        }
    }

    @Override
    public void afterSyncFailure(Film film, SyncCategory category) {
        // No recommendation-specific failure hook yet.
    }

    @Override
    public void backfillWeightsForFilm(Film film, SyncCategory category) {
        recommendationSyncProcessor.backfillWeightsForFilm(film);
    }

    private void enqueueCandidateEnrichmentAfterRecommendationSync(Film sourceFilm, SyncCategory category, Long userId) {
        if (category != SyncCategory.RECOMMENDATION || sourceFilm == null || sourceFilm.getInternalId() == null) {
            return;
        }

        // Use pass-2 scoring (without enrichment filter) to decide which candidates
        // are worth enriching. This breaks the circular dependency: non-enriched
        // films can still qualify based on language/rating placeholders from TMDB.
        if (userId != null) {
            List<Long> pass2Survivors = candidatePassFilter.getPass2SurvivorsForEnrichment(userId);
            if (pass2Survivors == null || pass2Survivors.isEmpty()) {
                return;
            }
            for (Film candidateFilm : filmRepository.findAllById(List.copyOf(pass2Survivors))) {
                enqueueEnrichmentTask(candidateFilm, userId);
            }
            return;
        }

        // Fallback (no userId): enqueue all direct candidates up to the configured cap.
        int maxCandidates = Math.max(0, recommendationEnrichmentMaxCandidatesPerSync);
        if (maxCandidates == 0) {
            return;
        }

        List<Long> candidateIds = recommendationRepository.findRecommendedFilmIdsByFilmIds(
                Set.of(sourceFilm.getInternalId())
        ).stream().limit(maxCandidates).toList();

        if (candidateIds.isEmpty()) {
            return;
        }

        List<Long> boundedCandidateIds = candidateIds.stream()
                .filter(id -> id != null && !id.equals(sourceFilm.getInternalId()))
                .toList();

        for (Film candidateFilm : filmRepository.findAllById(boundedCandidateIds)) {
            enqueueEnrichmentTask(candidateFilm, userId);
        }
    }

    private void enqueueEnrichmentTask(Film candidateFilm, Long userId) {
        if (candidateFilm == null
                || candidateFilm.getInternalId() == null
                || candidateFilm.getFilmId() == null
                || candidateFilm.getType() == null
                || isEnrichmentCompleted(candidateFilm)) {
            return;
        }

        int resolvedMaxAttempts = syncTaskHelper.resolveMaxAttempts(SyncCategory.ENRICHMENT);

        SyncTask task = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(candidateFilm.getInternalId(), SyncCategory.ENRICHMENT)
                .orElseGet(() -> SyncTask.builder()
                        .filmInternalId(candidateFilm.getInternalId())
                        .tmdbId(candidateFilm.getFilmId())
                        .userId(userId)
                        .syncCategory(SyncCategory.ENRICHMENT)
                        .attempts(0)
                        .maxAttempts(resolvedMaxAttempts)
                        .status(SyncTaskStatus.PENDING)
                        .build());

        if (task.getStatus() == SyncTaskStatus.FAILED_PERMANENT) {
            task.setAttempts(0);
        }
        if (task.getAttempts() == null || task.getAttempts() < 0) {
            task.setAttempts(0);
        }
        if (task.getMaxAttempts() == null || task.getMaxAttempts() < 1 || task.getAttempts() == 0) {
            task.setMaxAttempts(resolvedMaxAttempts);
        }

        task.setTmdbId(candidateFilm.getFilmId());
        if (userId != null) {
            task.setUserId(userId);
        }
        task.setSyncCategory(SyncCategory.ENRICHMENT);
        task.setStatus(SyncTaskStatus.PENDING);
        task.setNextRetryAt(Instant.now());
        task.setLastErrorCode(null);
        task.setLastErrorMessage(null);

        syncTaskHelper.saveTaskWithConflictRecovery(task);
    }

    private boolean isEnrichmentCompleted(Film film) {
        return film != null
                && Boolean.TRUE.equals(film.getGenreSyncCompleted())
                && Boolean.TRUE.equals(film.getKeywordSyncCompleted())
                && Boolean.TRUE.equals(film.getCreditsSyncCompleted());
    }
}