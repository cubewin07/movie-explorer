package com.Backend.services.sync_service.service;

import com.Backend.exception.SyncProcessingException;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.film_service.service.TmdbClient;
import com.Backend.services.recommendation_service.metrics.RecommendationMetrics;
import com.Backend.services.sync_service.helper.SyncTaskHelper;
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
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

@Slf4j
@Service
public class FilmSyncTaskService {

    private static final EnumSet<SyncTaskStatus> RUNNABLE_STATUSES =
            EnumSet.of(SyncTaskStatus.PENDING, SyncTaskStatus.RETRYING);

    private final SyncTaskRepository syncTaskRepository;
    private final FilmRepository filmRepository;
    private final TmdbClient tmdbClient;
    private final SyncTaskHelper syncTaskHelper;
    private final RecommendationMetrics metrics;
    private final Map<SyncCategory, FilmSyncTaskHandler> handlers;
    private final PlatformTransactionManager transactionManager;

    @Value("${recommendation.sync.scheduler.max-tasks-per-tick:5}")
    private int recommendationMaxTasksPerTick;

    @Value("${recommendation.sync.scheduler.reserved-tokens:6}")
    private int recommendationReservedTokens;

    @Value("${recommendation.sync.max-requests-per-run:8}")
    private int recommendationMaxRequestsPerRun;

    public FilmSyncTaskService(
            SyncTaskRepository syncTaskRepository,
            FilmRepository filmRepository,
            TmdbClient tmdbClient,
            SyncTaskHelper syncTaskHelper,
            RecommendationMetrics metrics,
            List<FilmSyncTaskHandler> handlers,
            PlatformTransactionManager transactionManager
    ) {
        this.syncTaskRepository = syncTaskRepository;
        this.filmRepository = filmRepository;
        this.tmdbClient = tmdbClient;
        this.syncTaskHelper = syncTaskHelper;
        this.metrics = metrics;
        this.transactionManager = transactionManager;
        this.handlers = handlers.stream()
                .flatMap(handler -> handler.getSupportedCategories().stream()
                        .map(category -> Map.entry(category, handler)))
                .collect(Collectors.toUnmodifiableMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    @Transactional
    public SyncAttemptResult syncNowOrQueue(Film film, Long tmdbId, SyncCategory category) {
        return syncNowOrQueue(film, tmdbId, category, null);
    }

    @Transactional
    public SyncAttemptResult syncNowOrQueue(Film film, Long tmdbId, SyncCategory category, Long userId) {
        if (film == null || film.getInternalId() == null || tmdbId == null || category == null) {
            return SyncAttemptResult.invalidInput("Missing sync input (film/tmdbId/category)");
        }
        FilmSyncTaskHandler handler = handlers.get(category);
        if (handler == null) {
            log.warn("No sync task handler is configured for category={}", category);
            return SyncAttemptResult.unsupportedCategory("No sync task handler configured for category " + category);
        }

        Film workingFilm = handler.prepareFilm(film, category);
        if (workingFilm == null) {
            return SyncAttemptResult.failedPermanently(false, "FILM_NOT_FOUND", "Film no longer exists for sync");
        }

        boolean wasSynced = handler.isSyncCompleted(workingFilm, category);

        if (wasSynced) {
            handler.afterSyncSuccess(workingFilm, category, userId);
            return SyncAttemptResult.alreadySynced();
        }

        SyncTaskExecutionGuard guard = handler.beforeSync(workingFilm, category);
        if (!guard.canRun()) {
            metrics.recordBudgetExhausted(category);
            enqueuePendingSync(workingFilm, tmdbId, category, userId);
            return SyncAttemptResult.retryScheduled(false, guard.errorCode(), guard.errorMessage());
        }

        workingFilm = guard.film();
        if (workingFilm == null) {
            return SyncAttemptResult.failedPermanently(false, "FILM_NOT_FOUND", "Film no longer exists for sync");
        }

        try {
            if (workingFilm.getType() == null) {
                throw new SyncProcessingException("FILM_TYPE_MISSING", "Film type is missing for sync category " + category);
            }
            handler.syncForFilm(tmdbId, workingFilm, category);
            handler.markSyncCompleted(workingFilm, category);
            handler.afterSyncSuccess(workingFilm, category, userId);
            return SyncAttemptResult.synced(wasSynced);
        } catch (RuntimeException ex) {
            handler.afterSyncFailure(workingFilm, category);
            if (ex instanceof LocalBudgetDeferException) {
                metrics.recordBudgetExhausted(category);
            }
            SyncRetryEnqueueResult retryResult = enqueueRetry(workingFilm, tmdbId, category, userId, ex);

            log.warn("Failed to sync category={} for filmInternalId={} tmdbId={} type={}",
                    category, workingFilm.getInternalId(), tmdbId, workingFilm.getType(), ex);
            return toAttemptResult(wasSynced, retryResult);
        }
    }

    private SyncAttemptResult toAttemptResult(boolean wasSynced, SyncRetryEnqueueResult retryResult) {
        if (retryResult.failedPermanently()) {
            return SyncAttemptResult.failedPermanently(
                    wasSynced,
                    retryResult.errorCode(),
                    retryResult.errorMessage()
            );
        }
        if (retryResult.retryScheduled()) {
            return SyncAttemptResult.retryScheduled(
                    wasSynced,
                    retryResult.errorCode(),
                    retryResult.errorMessage()
            );
        }
        return SyncAttemptResult.failedWithoutRetry(
                wasSynced,
                retryResult.errorCode(),
                retryResult.errorMessage()
        );
    }

    @Transactional
    public void enqueuePendingSync(Film film, Long tmdbId, SyncCategory category) {
        enqueuePendingSync(film, tmdbId, category, null);
    }

    @Transactional
    public void enqueuePendingSync(Film film, Long tmdbId, SyncCategory category, Long userId) {
        if (film == null || film.getInternalId() == null || tmdbId == null || category == null) {
            return;
        }

        FilmSyncTaskHandler handler = handlers.get(category);
        if (handler == null) {
            log.warn("No sync task handler is configured for category={}", category);
            return;
        }

        if (handler.isSyncCompleted(film, category)) {
            return;
        }

        int resolvedMaxAttempts = syncTaskHelper.resolveMaxAttempts(category);

        SyncTask task = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(film.getInternalId(), category)
                .orElseGet(() -> SyncTask.builder()
                        .filmInternalId(film.getInternalId())
                        .tmdbId(tmdbId)
                        .userId(userId)
                        .syncCategory(category)
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

        task.setTmdbId(tmdbId);
        if (userId != null) {
            task.setUserId(userId);
        }
        task.setSyncCategory(category);
        task.setStatus(SyncTaskStatus.PENDING);
        task.setNextRetryAt(Instant.now());
        task.setLastErrorCode(null);
        task.setLastErrorMessage(null);

        syncTaskHelper.saveTaskWithConflictRecovery(task);
    }

    @Transactional
    private SyncRetryEnqueueResult enqueueRetry(Film film, Long tmdbId, SyncCategory category, RuntimeException error) {
        return enqueueRetry(film, tmdbId, category, null, error);
    }

    @Transactional
    private SyncRetryEnqueueResult enqueueRetry(Film film, Long tmdbId, SyncCategory category, Long userId, RuntimeException error) {
        if (film == null || film.getInternalId() == null || tmdbId == null || category == null) {
            return new SyncRetryEnqueueResult(false, true, "INVALID_INPUT", "Missing sync input for retry enqueue");
        }

        int resolvedMaxAttempts = syncTaskHelper.resolveMaxAttempts(category);

        try {
            SyncTask task = syncTaskRepository
                    .findByFilmInternalIdAndSyncCategory(film.getInternalId(), category)
                    .orElseGet(() -> SyncTask.builder()
                            .filmInternalId(film.getInternalId())
                            .tmdbId(tmdbId)
                            .userId(userId)
                            .syncCategory(category)
                            .attempts(0)
                            .maxAttempts(resolvedMaxAttempts)
                            .status(SyncTaskStatus.PENDING)
                            .build());

            if (task.getAttempts() == null || task.getAttempts() < 0) {
                task.setAttempts(0);
            }
            if (task.getMaxAttempts() == null || task.getMaxAttempts() < 1 || task.getAttempts() == 0) {
                task.setMaxAttempts(resolvedMaxAttempts);
            }

            int nextAttempt = task.getAttempts() + 1;
            SyncRetryDecision decision = syncTaskHelper.toRetryDecision(error, nextAttempt);

            task.setAttempts(nextAttempt);
            task.setTmdbId(tmdbId);
            if (userId != null) {
                task.setUserId(userId);
            }
            task.setSyncCategory(category);
            task.setLastErrorCode(decision.errorCode());
            task.setLastErrorMessage(decision.errorMessage());

            boolean retryable = decision.retryable() && nextAttempt < task.getMaxAttempts();
            if (retryable) {
                task.setStatus(nextAttempt <= 1 ? SyncTaskStatus.PENDING : SyncTaskStatus.RETRYING);
                task.setNextRetryAt(Instant.now().plus(decision.delay()));
                syncTaskHelper.recordRetryScheduled(category, decision.errorCode());
            } else {
                task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
                task.setNextRetryAt(null);
                syncTaskHelper.recordDeadLetter(category, decision.errorCode());
                syncTaskHelper.logPermanentFailure(
                        category,
                        task.getFilmInternalId(),
                        tmdbId,
                        nextAttempt,
                        task.getMaxAttempts(),
                        decision.errorCode(),
                        decision.errorMessage(),
                        error
                );
            }

            SyncTask savedTask = syncTaskHelper.saveTaskWithConflictRecovery(task);
            boolean scheduled = savedTask.getStatus() == SyncTaskStatus.PENDING || savedTask.getStatus() == SyncTaskStatus.RETRYING;
            boolean permanent = savedTask.getStatus() == SyncTaskStatus.FAILED_PERMANENT;
            return new SyncRetryEnqueueResult(
                    scheduled,
                    permanent,
                    savedTask.getLastErrorCode(),
                    savedTask.getLastErrorMessage()
            );
        } catch (RuntimeException ex) {
            log.error(
                    "Failed to enqueue retry for category={} filmInternalId={} tmdbId={} errorClass={} reason={}",
                    category,
                    film.getInternalId(),
                    tmdbId,
                    ex.getClass().getSimpleName(),
                    ex.getMessage(),
                    ex
            );
            return new SyncRetryEnqueueResult(false, false, "RETRY_ENQUEUE_FAILED", ex.getMessage());
        }
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

    @Scheduled(fixedDelayString = "${recommendation.metrics.queue-depth-interval-ms:30000}")
    public void sampleSyncTaskQueueDepth() {
        long pendingCount = syncTaskRepository.countByStatusIn(RUNNABLE_STATUSES);
        metrics.setSyncTaskQueueDepth(pendingCount);
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
            syncTaskHelper.logPermanentFailure(
                    task.getSyncCategory(),
                    null,
                    task.getTmdbId(),
                    task.getAttempts(),
                    task.getMaxAttempts(),
                    task.getLastErrorCode(),
                    task.getLastErrorMessage(),
                    null
            );
            return;
        }

        Film film = filmRepository.findById(filmInternalId).orElse(null);
        if (film == null) {
            task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
            task.setLastErrorCode("FILM_NOT_FOUND");
            task.setLastErrorMessage("Film no longer exists for retry task");
            task.setNextRetryAt(null);
            syncTaskHelper.logPermanentFailure(
                    task.getSyncCategory(),
                    filmInternalId,
                    task.getTmdbId(),
                    task.getAttempts(),
                    task.getMaxAttempts(),
                    task.getLastErrorCode(),
                    task.getLastErrorMessage(),
                    null
            );
            return;
        }

        SyncCategory category = task.getSyncCategory();
        FilmSyncTaskHandler handler = handlers.get(category);
        if (handler == null) {
            task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
            task.setLastErrorCode("SYNC_CATEGORY_UNSUPPORTED");
            task.setLastErrorMessage("No sync task handler configured for category " + category);
            task.setNextRetryAt(null);
            syncTaskHelper.logPermanentFailure(
                    category,
                    task.getFilmInternalId(),
                    task.getTmdbId(),
                    task.getAttempts(),
                    task.getMaxAttempts(),
                    task.getLastErrorCode(),
                    task.getLastErrorMessage(),
                    null
            );
            return;
        }

        film = handler.prepareFilm(film, category);
        if (film == null) {
            task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
            task.setLastErrorCode("FILM_NOT_FOUND");
            task.setLastErrorMessage("Film no longer exists for retry task");
            task.setNextRetryAt(null);
            syncTaskHelper.logPermanentFailure(
                    category,
                    filmInternalId,
                    task.getTmdbId(),
                    task.getAttempts(),
                    task.getMaxAttempts(),
                    task.getLastErrorCode(),
                    task.getLastErrorMessage(),
                    null
            );
            return;
        }

        boolean wasSynced = handler.isSyncCompleted(film, category);
        if (wasSynced) {
            handler.afterSyncSuccess(film, category, task.getUserId());
            task.setStatus(SyncTaskStatus.SUCCEEDED);
            task.setNextRetryAt(null);
            task.setLastErrorCode(null);
            task.setLastErrorMessage(null);
            return;
        }

        SyncTaskExecutionGuard guard = handler.beforeSync(film, category);
        if (!guard.canRun()) {
            task.setStatus(SyncTaskStatus.RETRYING);
            task.setLastErrorCode(guard.errorCode());
            task.setLastErrorMessage(guard.errorMessage());
            task.setNextRetryAt(guard.nextRetryAt() == null ? Instant.now() : guard.nextRetryAt());
            syncTaskHelper.recordRetryScheduled(category, task.getLastErrorCode());
            return;
        }

        film = guard.film();
        if (film == null) {
            task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
            task.setLastErrorCode("FILM_NOT_FOUND");
            task.setLastErrorMessage("Film no longer exists for retry task");
            task.setNextRetryAt(null);
            syncTaskHelper.logPermanentFailure(
                    category,
                    filmInternalId,
                    task.getTmdbId(),
                    task.getAttempts(),
                    task.getMaxAttempts(),
                    task.getLastErrorCode(),
                    task.getLastErrorMessage(),
                    null
            );
            return;
        }
        task = syncTaskRepository.findById(taskId).orElse(null);
        if (task == null || !RUNNABLE_STATUSES.contains(task.getStatus())) {
            return;
        }

        try {
            if (film.getType() == null) {
                task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
                task.setLastErrorCode("FILM_TYPE_MISSING");
                task.setLastErrorMessage("Film type is missing for retry task");
                task.setNextRetryAt(null);
                syncTaskHelper.logPermanentFailure(
                        category,
                        task.getFilmInternalId(),
                        task.getTmdbId(),
                        task.getAttempts(),
                        task.getMaxAttempts(),
                        task.getLastErrorCode(),
                        task.getLastErrorMessage(),
                        null
                );
                return;
            }

            handler.syncForFilm(task.getTmdbId(), film, category);
            handler.markSyncCompleted(film, category);
            handler.afterSyncSuccess(film, category, task.getUserId());

            task.setStatus(SyncTaskStatus.SUCCEEDED);
            task.setNextRetryAt(null);
            task.setLastErrorCode(null);
            task.setLastErrorMessage(null);

            if (!wasSynced) {
                handler.backfillWeightsForFilm(film, category);
            }
        } catch (LocalBudgetDeferException ex) {
            handler.afterSyncFailure(film, category);
            task.setStatus(SyncTaskStatus.RETRYING);
            task.setLastErrorCode(ex.getErrorCode());
            task.setLastErrorMessage(ex.getMessage());
            long jitterMs = ThreadLocalRandom.current().nextLong(250L, 1250L);
            task.setNextRetryAt(Instant.now().plus(ex.getRetryDelay()).plusMillis(jitterMs));
            syncTaskHelper.recordRetryScheduled(category, ex.getErrorCode());

            log.debug("Deferred sync for category={} filmInternalId={} tmdbId={} reason={}",
                    category, task.getFilmInternalId(), task.getTmdbId(), ex.getMessage());
        } catch (RuntimeException ex) {
            handler.afterSyncFailure(film, category);
            if (task.getAttempts() == null || task.getAttempts() < 0) {
                task.setAttempts(0);
            }
            if (task.getMaxAttempts() == null || task.getMaxAttempts() < 1) {
                task.setMaxAttempts(syncTaskHelper.resolveMaxAttempts(category));
            }

            int nextAttempt = task.getAttempts() + 1;
            SyncRetryDecision decision = syncTaskHelper.toRetryDecision(ex, nextAttempt);

            task.setAttempts(nextAttempt);
            task.setLastErrorCode(decision.errorCode());
            task.setLastErrorMessage(decision.errorMessage());

            if (decision.retryable() && nextAttempt < task.getMaxAttempts()) {
                task.setStatus(SyncTaskStatus.RETRYING);
                task.setNextRetryAt(Instant.now().plus(decision.delay()));
                syncTaskHelper.recordRetryScheduled(category, decision.errorCode());
                log.warn("Sync retry scheduled for category={} filmInternalId={} tmdbId={} attempt={} nextRetryAt={} code={}",
                        category,
                        task.getFilmInternalId(),
                        task.getTmdbId(),
                        nextAttempt,
                        task.getNextRetryAt(),
                        task.getLastErrorCode(),
                        ex);
            } else {
                task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
                task.setNextRetryAt(null);
                syncTaskHelper.logPermanentFailure(
                        category,
                        task.getFilmInternalId(),
                        task.getTmdbId(),
                        nextAttempt,
                        task.getMaxAttempts(),
                        task.getLastErrorCode(),
                        task.getLastErrorMessage(),
                        ex
                );
            }
        }

        // The outer @Transactional transaction may have been marked rollback-only by a
        // nested @Transactional service (e.g. GenreService.syncGenresForFilm).  Persist
        // the final task state in a REQUIRES_NEW transaction so it survives regardless.
        final SyncTask finalTask = syncTaskRepository.findById(taskId).orElse(null);
        if (finalTask != null) {
            TransactionTemplate requiresNew = new TransactionTemplate(transactionManager);
            requiresNew.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
            requiresNew.executeWithoutResult(status -> syncTaskRepository.save(finalTask));
        }
    }

    private record SyncRetryEnqueueResult(
            boolean retryScheduled,
            boolean failedPermanently,
            String errorCode,
            String errorMessage
    ) {
    }
}
