package com.Backend.services.director_service.service;

import com.Backend.services.director_service.model.DirectorSyncRetryDecision;
import com.Backend.services.director_service.model.DirectorSyncTask;
import com.Backend.services.director_service.model.DirectorSyncTaskStatus;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.repository.FilmRepository;
import java.time.Instant;
import java.util.EnumSet;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Backend.services.director_service.repository.DirectorSyncTaskRepository;

@Slf4j
@Service
@RequiredArgsConstructor
public class DirectorSyncTaskService {

    private static final EnumSet<DirectorSyncTaskStatus> RUNNABLE_STATUSES =
            EnumSet.of(DirectorSyncTaskStatus.PENDING, DirectorSyncTaskStatus.RETRYING);

    private final DirectorService directorService;
    private final DirectorSyncTaskRepository directorSyncTaskRepository;
    private final DirectorSyncRetryPolicy directorSyncRetryPolicy;
    private final FilmRepository filmRepository;
    private final DirectorWeightService directorWeightService;

    @Value("${director.sync.retry.max-attempts:8}")
    private int defaultMaxAttempts;

    @Transactional
    public void enqueueRetry(Film film, Long tmdbId, RuntimeException error) {
        if (film == null || film.getInternalId() == null || tmdbId == null) {
            return;
        }
        DirectorSyncTask task = directorSyncTaskRepository
                .findByFilmInternalId(film.getInternalId())
                .orElseGet(() -> DirectorSyncTask.builder()
                        .filmInternalId(film.getInternalId())
                        .tmdbId(tmdbId)
                        .attempts(0)
                        .maxAttempts(Math.max(1, defaultMaxAttempts))
                        .status(DirectorSyncTaskStatus.PENDING)
                        .build());

        int nextAttempt = Math.max(0, task.getAttempts()) + 1;
        DirectorSyncRetryDecision decision = directorSyncRetryPolicy.decide(error, nextAttempt);

        task.setTmdbId(tmdbId);
        task.setLastErrorCode(decision.errorCode());
        task.setLastErrorMessage(decision.errorMessage());

        if (decision.retryable() && nextAttempt < task.getMaxAttempts()) {
            task.setStatus(nextAttempt <= 1 ? DirectorSyncTaskStatus.PENDING : DirectorSyncTaskStatus.RETRYING);
            task.setNextRetryAt(Instant.now().plus(decision.delay()));
        } else {
            task.setStatus(DirectorSyncTaskStatus.FAILED_PERMANENT);
            task.setNextRetryAt(null);
        }

        directorSyncTaskRepository.save(task);
    }

    @Scheduled(fixedDelayString = "${director.sync.retry.fixed-delay-ms:30000}")
    public void processRetries() {
        List<DirectorSyncTask> dueTasks = directorSyncTaskRepository
                .findTop50ByStatusInAndNextRetryAtLessThanEqualOrderByNextRetryAtAsc(RUNNABLE_STATUSES, Instant.now());
        for (DirectorSyncTask task : dueTasks) {
            processTask(task.getId());
        }
    }

    @Transactional
    public void processTask(Long taskId) {
        if (taskId == null) {
            return;
        }
        DirectorSyncTask task = directorSyncTaskRepository.findById(taskId).orElse(null);
        if (task == null || !RUNNABLE_STATUSES.contains(task.getStatus())) {
            return;
        }

        Long filmInternalId = task.getFilmInternalId();
        if (filmInternalId == null) {
            task.setStatus(DirectorSyncTaskStatus.FAILED_PERMANENT);
            task.setLastErrorCode("FILM_NOT_FOUND");
            task.setLastErrorMessage("Missing film reference for retry task");
            task.setNextRetryAt(null);
            return;
        }

        Film film = filmRepository.findById(filmInternalId).orElse(null);
        if (film == null) {
            task.setStatus(DirectorSyncTaskStatus.FAILED_PERMANENT);
            task.setLastErrorCode("FILM_NOT_FOUND");
            task.setLastErrorMessage("Film no longer exists for retry task");
            task.setNextRetryAt(null);
            return;
        }

        boolean wasSynced = Boolean.TRUE.equals(film.getDirectorSyncCompleted());
        try {
            if (film.getType() == null) {
                task.setStatus(DirectorSyncTaskStatus.FAILED_PERMANENT);
                task.setLastErrorCode("FILM_TYPE_MISSING");
                task.setLastErrorMessage("Film type is missing for retry task");
                task.setNextRetryAt(null);
                return;
            }
            directorService.syncDirectorsForFilm(task.getTmdbId(), film.getType(), film);
            film.setDirectorSyncCompleted(true);
            task.setStatus(DirectorSyncTaskStatus.SUCCEEDED);
            task.setNextRetryAt(null);
            task.setLastErrorCode(null);
            task.setLastErrorMessage(null);

            if (!wasSynced) {
                directorWeightService.backfillWeightsForFilm(film);
            }
        } catch (RuntimeException ex) {
            int nextAttempt = Math.max(0, task.getAttempts()) + 1;
            DirectorSyncRetryDecision decision = directorSyncRetryPolicy.decide(ex, nextAttempt);
            task.setAttempts(nextAttempt);
            task.setLastErrorCode(decision.errorCode());
            task.setLastErrorMessage(decision.errorMessage());

            if (decision.retryable() && nextAttempt < task.getMaxAttempts()) {
                task.setStatus(DirectorSyncTaskStatus.RETRYING);
                task.setNextRetryAt(Instant.now().plus(decision.delay()));
            } else {
                task.setStatus(DirectorSyncTaskStatus.FAILED_PERMANENT);
                task.setNextRetryAt(null);
            }
            log.warn("Director sync retry failed for filmInternalId={} tmdbId={} attempt={} status={}",
                    task.getFilmInternalId(), task.getTmdbId(), nextAttempt, task.getStatus(), ex);
        }
    }
}
