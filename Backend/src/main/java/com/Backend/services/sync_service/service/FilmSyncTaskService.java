package com.Backend.services.sync_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.film_service.service.TmdbClient;
import com.Backend.services.sync_service.model.LocalBudgetDeferException;
import com.Backend.services.sync_service.model.SyncAttemptResult;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.model.SyncRetryDecision;
import com.Backend.services.sync_service.model.SyncTask;
import com.Backend.services.sync_service.model.SyncTaskStatus;
import com.Backend.services.sync_service.repository.SyncTaskRepository;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
public class FilmSyncTaskService {

    private static final EnumSet<SyncTaskStatus> RUNNABLE_STATUSES =
            EnumSet.of(SyncTaskStatus.PENDING, SyncTaskStatus.RETRYING);

    private final SyncTaskRepository syncTaskRepository;
    private final SyncRetryPolicy syncRetryPolicy;
    private final FilmRepository filmRepository;
    private final TmdbClient tmdbClient;
    private final Map<SyncCategory, FilmSyncProcessor> processors;

    @Value("${sync.retry.max-attempts:8}")
    private int defaultMaxAttempts;

    @Value("${recommendation.sync.scheduler.max-tasks-per-tick:5}")
    private int recommendationMaxTasksPerTick;

    @Value("${recommendation.sync.scheduler.reserved-tokens:6}")
    private int recommendationReservedTokens;

    @Value("${recommendation.sync.max-requests-per-run:8}")
    private int recommendationMaxRequestsPerRun;

    public FilmSyncTaskService(
            SyncTaskRepository syncTaskRepository,
            SyncRetryPolicy syncRetryPolicy,
            FilmRepository filmRepository,
            TmdbClient tmdbClient,
            List<FilmSyncProcessor> processors
    ) {
        this.syncTaskRepository = syncTaskRepository;
        this.syncRetryPolicy = syncRetryPolicy;
        this.filmRepository = filmRepository;
        this.tmdbClient = tmdbClient;
        this.processors = processors.stream()
                .collect(Collectors.toUnmodifiableMap(FilmSyncProcessor::getCategory, Function.identity()));
    }

    @Transactional
    public SyncAttemptResult syncNowOrQueue(Film film, Long tmdbId, SyncCategory category) {
        if (film == null || film.getInternalId() == null || tmdbId == null || category == null) {
            return new SyncAttemptResult(false, false);
        }
        FilmSyncProcessor processor = processors.get(category);
        if (processor == null) {
            log.warn("No sync processor is configured for category={}", category);
            return new SyncAttemptResult(false, false);
        }

        boolean wasSynced = processor.isSyncCompleted(film);

        if(wasSynced) {
            return new SyncAttemptResult(true, true);
        }

        try {
            if (film.getType() == null) {
                throw new IllegalStateException("Film type is missing for sync category " + category);
            }
            processor.syncForFilm(tmdbId, film);
            processor.markSyncCompleted(film);
            return new SyncAttemptResult(wasSynced, true);
        } catch (RuntimeException ex) {
                // If sync fails, we enqueue a retry task and log the error.
                // No need to check if wasSynced is true anymore as we already return early in that case.
                enqueueRetry(film, tmdbId, category, ex);
                
            log.warn("Failed to sync category={} for filmInternalId={} tmdbId={} type={}",
                    category, film.getInternalId(), tmdbId, film.getType(), ex);
            return new SyncAttemptResult(wasSynced, false);
        }
    }

    @Transactional
    public void enqueuePendingSync(Film film, Long tmdbId, SyncCategory category) {
        if (film == null || film.getInternalId() == null || tmdbId == null || category == null) {
            return;
        }

        FilmSyncProcessor processor = processors.get(category);
        if (processor == null) {
            log.warn("No sync processor is configured for category={}", category);
            return;
        }

        if (processor.isSyncCompleted(film)) {
            return;
        }

        SyncTask task = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(film.getInternalId(), category)
                .orElseGet(() -> SyncTask.builder()
                        .filmInternalId(film.getInternalId())
                        .tmdbId(tmdbId)
                        .syncCategory(category)
                        .attempts(0)
                        .maxAttempts(Math.max(1, defaultMaxAttempts))
                        .status(SyncTaskStatus.PENDING)
                        .build());

        if (task.getStatus() == SyncTaskStatus.FAILED_PERMANENT) {
            task.setAttempts(0);
        }

        if (task.getMaxAttempts() == null || task.getMaxAttempts() < 1) {
            task.setMaxAttempts(Math.max(1, defaultMaxAttempts));
        }
        if (task.getAttempts() == null || task.getAttempts() < 0) {
            task.setAttempts(0);
        }

        task.setTmdbId(tmdbId);
        task.setSyncCategory(category);
        task.setStatus(SyncTaskStatus.PENDING);
        task.setNextRetryAt(Instant.now());
        task.setLastErrorCode(null);
        task.setLastErrorMessage(null);

        syncTaskRepository.save(task);
    }

    @Transactional
    public void enqueueRetry(Film film, Long tmdbId, SyncCategory category, RuntimeException error) {
        if (film == null || film.getInternalId() == null || tmdbId == null || category == null) {
            return;
        }

        SyncTask task = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(film.getInternalId(), category)
                .orElseGet(() -> SyncTask.builder()
                        .filmInternalId(film.getInternalId())
                        .tmdbId(tmdbId)
                        .syncCategory(category)
                        .attempts(0)
                        .maxAttempts(Math.max(1, defaultMaxAttempts))
                        .status(SyncTaskStatus.PENDING)
                        .build());

        int nextAttempt = Math.max(0, task.getAttempts()) + 1;
        SyncRetryDecision decision = syncRetryPolicy.decide(error, nextAttempt);

        task.setAttempts(nextAttempt);
        task.setTmdbId(tmdbId);
        task.setSyncCategory(category);
        task.setLastErrorCode(decision.errorCode());
        task.setLastErrorMessage(decision.errorMessage());

        if (decision.retryable() && nextAttempt < task.getMaxAttempts()) {
            task.setStatus(nextAttempt <= 1 ? SyncTaskStatus.PENDING : SyncTaskStatus.RETRYING);
            task.setNextRetryAt(Instant.now().plus(decision.delay()));
        } else {
            task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
            task.setNextRetryAt(null);
        }

        syncTaskRepository.save(task);
    }

    @Scheduled(fixedDelayString = "${sync.retry.fixed-delay-ms:30000}")
    public void processRetries() {
        List<SyncTask> dueTasks = syncTaskRepository
                .findTop50ByStatusInAndNextRetryAtLessThanEqualOrderByNextRetryAtAsc(RUNNABLE_STATUSES, Instant.now());
        if (dueTasks.isEmpty()) {
            return;
        }

        int nonRecommendationTasks = 0;
        List<SyncTask> recommendationTasks = dueTasks.stream()
                .filter(task -> {
                    boolean isRecommendation = task.getSyncCategory() == SyncCategory.RECOMMENDATION;
                    if (!isRecommendation) {
                        processTask(task.getId());
                    }
                    return isRecommendation;
                })
                .toList();

        for (SyncTask task : dueTasks) {
            if (task.getSyncCategory() != SyncCategory.RECOMMENDATION) {
                nonRecommendationTasks++;
            }
        }

        int allowedRecommendationTasks = computeAllowedRecommendationTasks(
                recommendationTasks.size(),
                nonRecommendationTasks
        );

        for (int i = 0; i < allowedRecommendationTasks; i++) {
            processTask(recommendationTasks.get(i).getId());
        }
    }

    private int computeAllowedRecommendationTasks(int recommendationTaskCount, int nonRecommendationTaskCount) {
        if (recommendationTaskCount <= 0) {
            return 0;
        }

        double availableTokens = tmdbClient.getAvailableTokens();
        int reservedTokens = nonRecommendationTaskCount > 0 ? Math.max(0, recommendationReservedTokens) : 0;
        int tokensForRecommendation = (int) Math.floor(Math.max(0.0d, availableTokens - reservedTokens));
        if (tokensForRecommendation < 1) {
            return 0;
        }

        int maxTasksPerTick = Math.max(1, recommendationMaxTasksPerTick);
        int perTaskBudget = Math.max(1, recommendationMaxRequestsPerRun);
        int maxByBudget = Math.max(1, tokensForRecommendation / perTaskBudget);

        return Math.min(recommendationTaskCount, Math.min(maxTasksPerTick, maxByBudget));
    }

    @Transactional
    public void processTask(Long taskId) {
        if (taskId == null) {
            return;
        }

        SyncTask task = syncTaskRepository.findById(taskId).orElse(null);
        if (task == null || !RUNNABLE_STATUSES.contains(task.getStatus())) {
            return;
        }

        Long filmInternalId = task.getFilmInternalId();
        if (filmInternalId == null) {
            task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
            task.setLastErrorCode("FILM_NOT_FOUND");
            task.setLastErrorMessage("Missing film reference for retry task");
            task.setNextRetryAt(null);
            return;
        }

        Film film = filmRepository.findById(filmInternalId).orElse(null);
        if (film == null) {
            task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
            task.setLastErrorCode("FILM_NOT_FOUND");
            task.setLastErrorMessage("Film no longer exists for retry task");
            task.setNextRetryAt(null);
            return;
        }

        SyncCategory category = task.getSyncCategory();
        FilmSyncProcessor processor = processors.get(category);
        if (processor == null) {
            task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
            task.setLastErrorCode("SYNC_CATEGORY_UNSUPPORTED");
            task.setLastErrorMessage("No sync processor configured for category " + category);
            task.setNextRetryAt(null);
            return;
        }

        boolean wasSynced = processor.isSyncCompleted(film);

        try {
            if (film.getType() == null) {
                task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
                task.setLastErrorCode("FILM_TYPE_MISSING");
                task.setLastErrorMessage("Film type is missing for retry task");
                task.setNextRetryAt(null);
                return;
            }

            processor.syncForFilm(task.getTmdbId(), film);
            processor.markSyncCompleted(film);

            task.setStatus(SyncTaskStatus.SUCCEEDED);
            task.setNextRetryAt(null);
            task.setLastErrorCode(null);
            task.setLastErrorMessage(null);

            if (!wasSynced) {
                processor.backfillWeightsForFilm(film);
            }
        } catch (LocalBudgetDeferException ex) {
            task.setStatus(SyncTaskStatus.RETRYING);
            task.setLastErrorCode(ex.getErrorCode());
            task.setLastErrorMessage(ex.getMessage());
            long jitterMs = ThreadLocalRandom.current().nextLong(250L, 1250L);
            task.setNextRetryAt(Instant.now().plus(ex.getRetryDelay()).plusMillis(jitterMs));

            log.debug("Deferred sync for category={} filmInternalId={} tmdbId={} reason={}",
                    category, task.getFilmInternalId(), task.getTmdbId(), ex.getMessage());
        } catch (RuntimeException ex) {
            int nextAttempt = Math.max(0, task.getAttempts()) + 1;
            SyncRetryDecision decision = syncRetryPolicy.decide(ex, nextAttempt);

            task.setAttempts(nextAttempt);
            task.setLastErrorCode(decision.errorCode());
            task.setLastErrorMessage(decision.errorMessage());

            if (decision.retryable() && nextAttempt < task.getMaxAttempts()) {
                task.setStatus(SyncTaskStatus.RETRYING);
                task.setNextRetryAt(Instant.now().plus(decision.delay()));
            } else {
                task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
                task.setNextRetryAt(null);
            }

            log.warn("Sync retry failed for category={} filmInternalId={} tmdbId={} attempt={} status={}",
                    category, task.getFilmInternalId(), task.getTmdbId(), nextAttempt, task.getStatus(), ex);
        }
    }
}
