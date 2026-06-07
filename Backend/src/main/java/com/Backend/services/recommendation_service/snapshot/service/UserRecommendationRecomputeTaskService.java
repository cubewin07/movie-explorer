package com.Backend.services.recommendation_service.snapshot.service;

import com.Backend.services.recommendation_service.snapshot.model.RecommendationRecomputeTriggeredBy;
import com.Backend.services.recommendation_service.snapshot.model.UserRecomputeTask;
import com.Backend.services.recommendation_service.snapshot.repository.UserRecomputeTaskRepository;
import java.time.Instant;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserRecommendationRecomputeTaskService {

    private final UserRecomputeTaskRepository userRecomputeTaskRepository;

    @Value("${recommendation.recompute.debounce-seconds:30}")
    private int debounceSeconds;

    @Value("${recommendation.recompute.sync-complete-debounce-seconds:5}")
    private int syncCompleteDebounceSeconds;

    @Value("${recommendation.recompute.debounce-cap-seconds:300}")
    private int debounceCapSeconds;

    @Transactional
    public void scheduleRecompute(Long userId, RecommendationRecomputeTriggeredBy triggeredBy) {
        if (userId == null || triggeredBy == null) {
            return;
        }

        Instant now = Instant.now();
        int resolvedDebounce = Math.max(0, resolveDebounceSeconds(triggeredBy));
        int resolvedCap = Math.max(0, debounceCapSeconds);

        Instant desired = now.plusSeconds(resolvedDebounce);

        UserRecomputeTask existing = userRecomputeTaskRepository.findById(userId).orElse(null);
        if (existing == null) {
            UserRecomputeTask newTask = UserRecomputeTask.builder()
                    .userId(userId)
                    .scheduledAt(desired)
                    .triggeredBy(triggeredBy)
                    .attemptCount(0)
                    .lastError(null)
                .build();
            try {
                userRecomputeTaskRepository.save(Objects.requireNonNull(newTask, "task"));
            } catch (DataIntegrityViolationException ex) {
                UserRecomputeTask concurrentTask = userRecomputeTaskRepository.findById(userId).orElse(null);
                if (concurrentTask == null) {
                    throw ex;
                }
                concurrentTask.setScheduledAt(desired);
                concurrentTask.setTriggeredBy(triggeredBy);
                userRecomputeTaskRepository.save(concurrentTask);
            }
            return;
        }

        Instant base = existing.getScheduledAt() != null ? existing.getScheduledAt() : now;
        Instant capLimit = base.plusSeconds(resolvedCap);
        Instant next = desired.isBefore(capLimit) ? desired : capLimit;

        existing.setScheduledAt(next);
        existing.setTriggeredBy(triggeredBy);

        userRecomputeTaskRepository.save(existing);
    }

    private int resolveDebounceSeconds(RecommendationRecomputeTriggeredBy triggeredBy) {
        if (triggeredBy == RecommendationRecomputeTriggeredBy.RECOMMENDATION_SYNC_COMPLETE) {
            return syncCompleteDebounceSeconds;
        }
        return debounceSeconds;
    }
}
