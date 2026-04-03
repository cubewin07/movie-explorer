package com.Backend.services.keyword_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.keyword_service.model.KeywordSyncRetryDecision;
import com.Backend.services.keyword_service.model.KeywordSyncTask;
import com.Backend.services.keyword_service.model.KeywordSyncTaskStatus;
import com.Backend.services.keyword_service.repository.KeywordSyncTaskRepository;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeywordSyncTaskService {

    private static final EnumSet<KeywordSyncTaskStatus> RUNNABLE_STATUSES =
            EnumSet.of(KeywordSyncTaskStatus.PENDING, KeywordSyncTaskStatus.RETRYING);

    private final KeywordService keywordService;
    private final KeywordSyncTaskRepository keywordSyncTaskRepository;
    private final KeywordSyncRetryPolicy keywordSyncRetryPolicy;
    private final FilmRepository filmRepository;
    private final KeywordWeightService keywordWeightService;

    @Value("${keyword.sync.retry.max-attempts:8}")
    private int defaultMaxAttempts;

    @Transactional
    public void enqueueRetry(Film film, Long tmdbId, RuntimeException error) {
        if (film == null || film.getInternalId() == null || tmdbId == null) {
            return;
        }
        KeywordSyncTask task = keywordSyncTaskRepository
                .findByFilmInternalId(film.getInternalId())
                .orElseGet(() -> KeywordSyncTask.builder()
                        .filmInternalId(film.getInternalId())
                        .tmdbId(tmdbId)
                        .attempts(0)
                        .maxAttempts(Math.max(1, defaultMaxAttempts))
                        .status(KeywordSyncTaskStatus.PENDING)
                        .build());

        int nextAttempt = Math.max(0, task.getAttempts()) + 1;
        KeywordSyncRetryDecision decision = keywordSyncRetryPolicy.decide(error, nextAttempt);

        task.setLastErrorCode(decision.errorCode());
        task.setLastErrorMessage(decision.errorMessage());

        if (decision.retryable() && nextAttempt < task.getMaxAttempts()) {
            task.setStatus(nextAttempt <= 1 ? KeywordSyncTaskStatus.PENDING : KeywordSyncTaskStatus.RETRYING);
            task.setNextRetryAt(Instant.now().plus(decision.delay()));
        } else {
            task.setStatus(KeywordSyncTaskStatus.FAILED_PERMANENT);
            task.setNextRetryAt(null);
        }

        keywordSyncTaskRepository.save(task);
    }

    @Scheduled(fixedDelayString = "${keyword.sync.retry.fixed-delay-ms:30000}")
    public void processRetries() {
        List<KeywordSyncTask> dueTasks = keywordSyncTaskRepository
                .findTop50ByStatusInAndNextRetryAtLessThanEqualOrderByNextRetryAtAsc(RUNNABLE_STATUSES, Instant.now());
        for (KeywordSyncTask task : dueTasks) {
            processTask(task.getId());
        }
    }

    @Transactional
    public void processTask(Long taskId) {
        if (taskId == null) {
            return;
        }
        KeywordSyncTask task = keywordSyncTaskRepository.findById(taskId).orElse(null);
        if (task == null || !RUNNABLE_STATUSES.contains(task.getStatus())) {
            return;
        }

        Long filmInternalId = task.getFilmInternalId();
        if (filmInternalId == null) {
            task.setStatus(KeywordSyncTaskStatus.FAILED_PERMANENT);
            task.setLastErrorCode("FILM_NOT_FOUND");
            task.setLastErrorMessage("Missing film reference for retry task");
            task.setNextRetryAt(null);
            return;
        }

        Film film = filmRepository.findById(filmInternalId).orElse(null);
        if (film == null) {
            task.setStatus(KeywordSyncTaskStatus.FAILED_PERMANENT);
            task.setLastErrorCode("FILM_NOT_FOUND");
            task.setLastErrorMessage("Film no longer exists for retry task");
            task.setNextRetryAt(null);
            return;
        }

        boolean wasSynced = Boolean.TRUE.equals(film.getKeywordSyncCompleted());
        try {
            if (film.getType() == null) {
                task.setStatus(KeywordSyncTaskStatus.FAILED_PERMANENT);
                task.setLastErrorCode("FILM_TYPE_MISSING");
                task.setLastErrorMessage("Film type is missing for retry task");
                task.setNextRetryAt(null);
                return;
            }
            keywordService.syncKeywordsForFilm(task.getTmdbId(), film.getType(), film);
            film.setKeywordSyncCompleted(true);
            task.setStatus(KeywordSyncTaskStatus.SUCCEEDED);
            task.setNextRetryAt(null);
            task.setLastErrorCode(null);
            task.setLastErrorMessage(null);

            if (!wasSynced) {
                keywordWeightService.backfillWeightsForFilm(film);
            }
        } catch (RuntimeException ex) {
            int nextAttempt = Math.max(0, task.getAttempts()) + 1;
            KeywordSyncRetryDecision decision = keywordSyncRetryPolicy.decide(ex, nextAttempt);
            task.setAttempts(nextAttempt);
            task.setLastErrorCode(decision.errorCode());
            task.setLastErrorMessage(decision.errorMessage());

            if (decision.retryable() && nextAttempt < task.getMaxAttempts()) {
                task.setStatus(KeywordSyncTaskStatus.RETRYING);
                task.setNextRetryAt(Instant.now().plus(decision.delay()));
            } else {
                task.setStatus(KeywordSyncTaskStatus.FAILED_PERMANENT);
                task.setNextRetryAt(null);
            }
            log.warn("Keyword sync retry failed for filmInternalId={} tmdbId={} attempt={} status={}",
                    task.getFilmInternalId(), task.getTmdbId(), nextAttempt, task.getStatus(), ex);
        }
    }
}
