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
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.Function;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
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
    private final MeterRegistry meterRegistry;

    @Value("${sync.retry.max-attempts:8}")
    private int defaultMaxAttempts;

    @Value("${sync.retry.max-attempts.credits:${sync.retry.max-attempts:8}}")
    private int creditsMaxAttempts;

    @Value("${sync.retry.max-attempts.keyword:${sync.retry.max-attempts:8}}")
    private int keywordMaxAttempts;

    @Value("${sync.retry.max-attempts.genre:${sync.retry.max-attempts:8}}")
    private int genreMaxAttempts;

    @Value("${sync.retry.max-attempts.recommendation:${sync.retry.max-attempts:8}}")
    private int recommendationMaxAttempts;

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
            MeterRegistry meterRegistry,
            List<FilmSyncProcessor> processors
    ) {
        this.syncTaskRepository = syncTaskRepository;
        this.syncRetryPolicy = syncRetryPolicy;
        this.filmRepository = filmRepository;
        this.tmdbClient = tmdbClient;
        this.meterRegistry = meterRegistry;
        this.processors = processors.stream()
                .collect(Collectors.toUnmodifiableMap(FilmSyncProcessor::getCategory, Function.identity()));
    }

    @Transactional
    public SyncAttemptResult syncNowOrQueue(Film film, Long tmdbId, SyncCategory category) {
        if (film == null || film.getInternalId() == null || tmdbId == null || category == null) {
            return SyncAttemptResult.invalidInput("Missing sync input (film/tmdbId/category)");
        }
        FilmSyncProcessor processor = processors.get(category);
        if (processor == null) {
            log.warn("No sync processor is configured for category={}", category);
            return SyncAttemptResult.unsupportedCategory("No sync processor configured for category " + category);
        }

        boolean wasSynced = processor.isSyncCompleted(film);

        if (wasSynced) {
            return SyncAttemptResult.alreadySynced();
        }

        try {
            if (film.getType() == null) {
                throw new IllegalStateException("Film type is missing for sync category " + category);
            }
            processor.syncForFilm(tmdbId, film);
            processor.markSyncCompleted(film);
            return SyncAttemptResult.synced(wasSynced);
        } catch (RuntimeException ex) {
            SyncRetryEnqueueResult retryResult = enqueueRetry(film, tmdbId, category, ex);

            log.warn("Failed to sync category={} for filmInternalId={} tmdbId={} type={}",
                    category, film.getInternalId(), tmdbId, film.getType(), ex);
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

        int resolvedMaxAttempts = resolveMaxAttempts(category);

        SyncTask task = syncTaskRepository
                .findByFilmInternalIdAndSyncCategory(film.getInternalId(), category)
                .orElseGet(() -> SyncTask.builder()
                        .filmInternalId(film.getInternalId())
                        .tmdbId(tmdbId)
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
        task.setSyncCategory(category);
        task.setStatus(SyncTaskStatus.PENDING);
        task.setNextRetryAt(Instant.now());
        task.setLastErrorCode(null);
        task.setLastErrorMessage(null);

        saveTaskWithConflictRecovery(task);
    }

    @Transactional
    private SyncRetryEnqueueResult enqueueRetry(Film film, Long tmdbId, SyncCategory category, RuntimeException error) {
        if (film == null || film.getInternalId() == null || tmdbId == null || category == null) {
            return new SyncRetryEnqueueResult(false, true, "INVALID_INPUT", "Missing sync input for retry enqueue");
        }

        int resolvedMaxAttempts = resolveMaxAttempts(category);

        try {
            SyncTask task = syncTaskRepository
                    .findByFilmInternalIdAndSyncCategory(film.getInternalId(), category)
                    .orElseGet(() -> SyncTask.builder()
                            .filmInternalId(film.getInternalId())
                            .tmdbId(tmdbId)
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
            SyncRetryDecision decision = toRetryDecision(error, nextAttempt);

            task.setAttempts(nextAttempt);
            task.setTmdbId(tmdbId);
            task.setSyncCategory(category);
            task.setLastErrorCode(decision.errorCode());
            task.setLastErrorMessage(decision.errorMessage());

            boolean retryable = decision.retryable() && nextAttempt < task.getMaxAttempts();
            if (retryable) {
                task.setStatus(nextAttempt <= 1 ? SyncTaskStatus.PENDING : SyncTaskStatus.RETRYING);
                task.setNextRetryAt(Instant.now().plus(decision.delay()));
                recordRetryScheduled(category, decision.errorCode());
            } else {
                task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
                task.setNextRetryAt(null);
                logPermanentFailure(
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

            SyncTask savedTask = saveTaskWithConflictRecovery(task);
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

    private SyncRetryDecision toRetryDecision(RuntimeException error, int nextAttempt) {
        if (error instanceof LocalBudgetDeferException defer) {
            Duration delay = defer.getRetryDelay() == null ? Duration.ofSeconds(5) : defer.getRetryDelay();
            return new SyncRetryDecision(true, delay, defer.getErrorCode(), defer.getMessage());
        }
        return syncRetryPolicy.decide(error, nextAttempt);
    }

    private SyncTask saveTaskWithConflictRecovery(SyncTask task) {
        try {
            return syncTaskRepository.save(Objects.requireNonNull(task, "sync task"));
        } catch (DataIntegrityViolationException ex) {
            if (task.getFilmInternalId() == null || task.getSyncCategory() == null) {
                throw ex;
            }
            SyncTask existing = syncTaskRepository
                    .findByFilmInternalIdAndSyncCategory(task.getFilmInternalId(), task.getSyncCategory())
                    .orElseThrow(() -> ex);

            existing.setTmdbId(task.getTmdbId());
            existing.setSyncCategory(task.getSyncCategory());
            existing.setStatus(task.getStatus());
            existing.setAttempts(task.getAttempts());
            existing.setMaxAttempts(task.getMaxAttempts());
            existing.setNextRetryAt(task.getNextRetryAt());
            existing.setLastErrorCode(task.getLastErrorCode());
            existing.setLastErrorMessage(task.getLastErrorMessage());

            log.debug(
                    "Recovered sync_task save conflict for category={} filmInternalId={} tmdbId={}",
                    existing.getSyncCategory(),
                    existing.getFilmInternalId(),
                    existing.getTmdbId()
            );
            return syncTaskRepository.save(Objects.requireNonNull(existing, "existing sync task"));
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
            logPermanentFailure(
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
            logPermanentFailure(
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
        FilmSyncProcessor processor = processors.get(category);
        if (processor == null) {
            task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
            task.setLastErrorCode("SYNC_CATEGORY_UNSUPPORTED");
            task.setLastErrorMessage("No sync processor configured for category " + category);
            task.setNextRetryAt(null);
            logPermanentFailure(
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

        boolean wasSynced = processor.isSyncCompleted(film);

        try {
            if (film.getType() == null) {
                task.setStatus(SyncTaskStatus.FAILED_PERMANENT);
                task.setLastErrorCode("FILM_TYPE_MISSING");
                task.setLastErrorMessage("Film type is missing for retry task");
                task.setNextRetryAt(null);
                logPermanentFailure(
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
            recordRetryScheduled(category, ex.getErrorCode());

            log.debug("Deferred sync for category={} filmInternalId={} tmdbId={} reason={}",
                    category, task.getFilmInternalId(), task.getTmdbId(), ex.getMessage());
        } catch (RuntimeException ex) {
            if (task.getAttempts() == null || task.getAttempts() < 0) {
                task.setAttempts(0);
            }
            if (task.getMaxAttempts() == null || task.getMaxAttempts() < 1) {
                task.setMaxAttempts(resolveMaxAttempts(category));
            }

            int nextAttempt = task.getAttempts() + 1;
            SyncRetryDecision decision = toRetryDecision(ex, nextAttempt);

            task.setAttempts(nextAttempt);
            task.setLastErrorCode(decision.errorCode());
            task.setLastErrorMessage(decision.errorMessage());

            if (decision.retryable() && nextAttempt < task.getMaxAttempts()) {
                task.setStatus(SyncTaskStatus.RETRYING);
                task.setNextRetryAt(Instant.now().plus(decision.delay()));
                recordRetryScheduled(category, decision.errorCode());
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
                logPermanentFailure(
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
    }

    private void logPermanentFailure(
            SyncCategory category,
            Long filmInternalId,
            Long tmdbId,
            Integer attempts,
            Integer maxAttempts,
            String errorCode,
            String errorMessage,
            Throwable error
    ) {
        String safeMessage = errorMessage == null ? "n/a" : errorMessage;
        if (error == null) {
            log.error(
                    "Sync FAILED_PERMANENT category={} filmInternalId={} tmdbId={} attempts={} maxAttempts={} code={} reason={}",
                    category,
                    filmInternalId,
                    tmdbId,
                    attempts,
                    maxAttempts,
                    errorCode,
                    safeMessage
            );
                    incrementPermanentFailureMetric(category, errorCode);
            return;
        }

        log.error(
                "Sync FAILED_PERMANENT category={} filmInternalId={} tmdbId={} attempts={} maxAttempts={} code={} reason={}",
                category,
                filmInternalId,
                tmdbId,
                attempts,
                maxAttempts,
                errorCode,
                safeMessage,
                error
        );

        incrementPermanentFailureMetric(category, errorCode);
    }

    private int resolveMaxAttempts(SyncCategory category) {
        int fallback = Math.max(1, defaultMaxAttempts);
        if (category == null) {
            return fallback;
        }

        return switch (category) {
            case CREDITS -> Math.max(1, creditsMaxAttempts);
            case KEYWORD -> Math.max(1, keywordMaxAttempts);
            case GENRE -> Math.max(1, genreMaxAttempts);
            case RECOMMENDATION -> Math.max(1, recommendationMaxAttempts);
        };
    }

    private void recordRetryScheduled(SyncCategory category, String errorCode) {
        Counter.builder("sync.retry.scheduled")
                .tag("category", category == null ? "unknown" : category.name())
                .tag("errorCode", errorCode == null ? "UNKNOWN" : errorCode)
                .register(meterRegistry)
                .increment();
    }

    private void incrementPermanentFailureMetric(SyncCategory category, String errorCode) {
        Counter.builder("sync.failure.permanent")
                .tag("category", category == null ? "unknown" : category.name())
                .tag("errorCode", errorCode == null ? "UNKNOWN" : errorCode)
                .register(meterRegistry)
                .increment();
    }

    private record SyncRetryEnqueueResult(
            boolean retryScheduled,
            boolean failedPermanently,
            String errorCode,
            String errorMessage
    ) {
    }
}
