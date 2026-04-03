package com.Backend.services.sync_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.repository.FilmRepository;
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
    private final Map<SyncCategory, FilmSyncProcessor> processors;

    @Value("${sync.retry.max-attempts:8}")
    private int defaultMaxAttempts;

    public FilmSyncTaskService(
            SyncTaskRepository syncTaskRepository,
            SyncRetryPolicy syncRetryPolicy,
            FilmRepository filmRepository,
            List<FilmSyncProcessor> processors
    ) {
        this.syncTaskRepository = syncTaskRepository;
        this.syncRetryPolicy = syncRetryPolicy;
        this.filmRepository = filmRepository;
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

        try {
            if (film.getType() == null) {
                throw new IllegalStateException("Film type is missing for sync category " + category);
            }
            processor.syncForFilm(tmdbId, film);
            processor.markSyncCompleted(film);
            return new SyncAttemptResult(wasSynced, true);
        } catch (RuntimeException ex) {
            if (!wasSynced) {
                enqueueRetry(film, tmdbId, category, ex);
            }
            log.warn("Failed to sync category={} for filmInternalId={} tmdbId={} type={}",
                    category, film.getInternalId(), tmdbId, film.getType(), ex);
            return new SyncAttemptResult(wasSynced, false);
        }
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
        for (SyncTask task : dueTasks) {
            processTask(task.getId());
        }
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
