package com.Backend.services.recommendation_service.snapshot.service;

import com.Backend.services.recommendation_service.metrics.RecommendationMetrics;
import com.Backend.services.recommendation_service.snapshot.model.UserRecomputeTask;
import com.Backend.services.recommendation_service.snapshot.repository.UserRecomputeTaskRepository;
import io.micrometer.core.instrument.Timer;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationSnapshotScheduler {

    private final UserRecomputeTaskRepository userRecomputeTaskRepository;
    private final RecommendationSnapshotRecomputeService recomputeService;
    private final RecommendationMetrics metrics;
    private final PlatformTransactionManager transactionManager;

    @Value("${recommendation.recompute.scheduler.max-users-per-tick:10}")
    private int maxUsersPerTick;

    @Value("${recommendation.recompute.scheduler.failure-reschedule-seconds:30}")
    private int failureRescheduleSeconds;

    @Value("${recommendation.recompute.scheduler.max-attempts:10}")
    private int maxAttempts;

    @Scheduled(fixedDelayString = "${recommendation.recompute.scheduler.fixed-delay-ms:5000}")
    public void processDueRecomputeTasks() {
        int limit = Math.max(0, maxUsersPerTick);
        if (limit == 0) {
            return;
        }

        List<UserRecomputeTask> due = claimDueTasks(limit);
        if (due.isEmpty()) {
            return;
        }

        for (UserRecomputeTask task : due) {
            if (task == null || task.getUserId() == null) {
                continue;
            }

            Long userId = Objects.requireNonNull(task.getUserId(), "userId");

            Timer.Sample sample = metrics.startSnapshotRecomputeTimer();
            boolean success = false;
            try {
                recomputeService.recomputeSnapshotForUser(userId);
                success = true;
            } catch (RuntimeException ex) {
                success = false;
                int attempts = Math.max(0, task.getAttemptCount()) + 1;

                if (attempts >= Math.max(1, maxAttempts)) {
                    log.error(
                            "Dead-lettering user recompute task userId={} attempts={} reason={}",
                            userId,
                            attempts,
                            ex.getMessage(),
                            ex
                    );
                    metrics.stopSnapshotRecomputeTimer(sample, false);
                    continue;
                }

                Duration delay = Duration.ofSeconds(Math.max(1, failureRescheduleSeconds));
                Instant rescheduledAt = Instant.now().plus(delay);
                rescheduleTask(userId, task, attempts, rescheduledAt, ex);

                log.warn(
                        "Recommendation snapshot recompute failed; rescheduled userId={} attempt={} delaySeconds={}",
                        userId,
                        attempts,
                        delay.toSeconds(),
                        ex
                );
            } finally {
                metrics.stopSnapshotRecomputeTimer(sample, success);
            }
        }
    }

    @Scheduled(fixedDelayString = "${recommendation.metrics.queue-depth-interval-ms:30000}")
    public void sampleQueueDepth() {
        long recomputeCount = userRecomputeTaskRepository.count();
        metrics.setRecomputeQueueDepth(recomputeCount);
    }

    private List<UserRecomputeTask> claimDueTasks(int limit) {
        TransactionTemplate tx = new TransactionTemplate(
            Objects.requireNonNull(transactionManager, "transactionManager")
        );
        return tx.execute(status -> {
            List<UserRecomputeTask> locked = userRecomputeTaskRepository.findDueForUpdate(
                    Instant.now(),
                    PageRequest.of(0, limit)
            );

            if (locked.isEmpty()) {
                return List.of();
            }

            // Copy out the minimal task data we need, then delete the rows to "claim" them.
            List<UserRecomputeTask> claimed = locked.stream()
                    .filter(t -> t != null && t.getUserId() != null)
                    .map(t -> UserRecomputeTask.builder()
                            .userId(t.getUserId())
                            .scheduledAt(t.getScheduledAt())
                            .triggeredBy(t.getTriggeredBy())
                            .attemptCount(t.getAttemptCount())
                            .lastError(t.getLastError())
                            .build())
                    .toList();

            userRecomputeTaskRepository.deleteAll(locked);
            userRecomputeTaskRepository.flush();

            return claimed;
        });
    }

    private void rescheduleTask(
            Long userId,
            UserRecomputeTask claimed,
            int attempts,
            Instant rescheduledAt,
            RuntimeException ex
    ) {
        TransactionTemplate tx = new TransactionTemplate(
            Objects.requireNonNull(transactionManager, "transactionManager")
        );
        tx.executeWithoutResult(status -> {
            UserRecomputeTask existing = userRecomputeTaskRepository
                .findById(Objects.requireNonNull(userId, "userId"))
                .orElse(null);
            if (existing == null) {
                UserRecomputeTask newTask = UserRecomputeTask.builder()
                        .userId(userId)
                        .scheduledAt(rescheduledAt)
                        .triggeredBy(claimed.getTriggeredBy())
                        .attemptCount(attempts)
                        .lastError(ex.getClass().getSimpleName())
                        .build();
                userRecomputeTaskRepository.save(Objects.requireNonNull(newTask, "task"));
                return;
            }

            Instant existingAt = existing.getScheduledAt();
            if (existingAt != null && existingAt.isAfter(rescheduledAt)) {
                existing.setScheduledAt(existingAt);
            } else {
                existing.setScheduledAt(rescheduledAt);
            }

            existing.setAttemptCount(Math.max(existing.getAttemptCount(), attempts));
            existing.setLastError(ex.getClass().getSimpleName());
            userRecomputeTaskRepository.save(existing);
        });
    }
}
