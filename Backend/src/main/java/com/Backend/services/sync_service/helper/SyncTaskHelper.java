package com.Backend.services.sync_service.helper;

import com.Backend.services.sync_service.model.LocalBudgetDeferException;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.model.SyncRetryDecision;
import com.Backend.services.sync_service.model.SyncTask;
import com.Backend.services.sync_service.repository.SyncTaskRepository;
import com.Backend.services.sync_service.service.SyncRetryPolicy;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import java.time.Duration;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SyncTaskHelper {

    private final SyncRetryPolicy syncRetryPolicy;
    private final SyncTaskRepository syncTaskRepository;
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

    public SyncRetryDecision toRetryDecision(RuntimeException error, int nextAttempt) {
        if (error instanceof LocalBudgetDeferException defer) {
            Duration delay = defer.getRetryDelay() == null ? Duration.ofSeconds(5) : defer.getRetryDelay();
            return new SyncRetryDecision(true, delay, defer.getErrorCode(), defer.getMessage());
        }
        return syncRetryPolicy.decide(error, nextAttempt);
    }

    public int resolveMaxAttempts(SyncCategory category) {
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

    public SyncTask saveTaskWithConflictRecovery(SyncTask task) {
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

    public void recordRetryScheduled(SyncCategory category, String errorCode) {
        Counter.builder("sync.retry.scheduled")
                .tag("category", category == null ? "unknown" : category.name())
                .tag("errorCode", errorCode == null ? "UNKNOWN" : errorCode)
                .register(meterRegistry)
                .increment();
    }

    public void logPermanentFailure(
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

    private void incrementPermanentFailureMetric(SyncCategory category, String errorCode) {
        Counter.builder("sync.failure.permanent")
                .tag("category", category == null ? "unknown" : category.name())
                .tag("errorCode", errorCode == null ? "UNKNOWN" : errorCode)
                .register(meterRegistry)
                .increment();
    }
}
