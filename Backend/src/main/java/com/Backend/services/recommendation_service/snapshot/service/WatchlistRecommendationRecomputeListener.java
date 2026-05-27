package com.Backend.services.recommendation_service.snapshot.service;

import com.Backend.services.recommendation_service.snapshot.model.RecommendationRecomputeTriggeredBy;
import com.Backend.services.watchlist_service.event.WatchlistItemAddedEvent;
import com.Backend.services.watchlist_service.event.WatchlistItemRemovedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class WatchlistRecommendationRecomputeListener {

    private final UserRecommendationRecomputeTaskService taskService;

    @Async("watchlistSyncExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleWatchlistAdded(WatchlistItemAddedEvent event) {
        if (event == null || event.userId() == null) {
            return;
        }
        try {
            taskService.scheduleRecompute(event.userId(), RecommendationRecomputeTriggeredBy.WATCHLIST_ADD);
        } catch (RuntimeException ex) {
            log.error("Failed to enqueue recommendation recompute after watchlist add userId={}", event.userId(), ex);
        }
    }

    @Async("watchlistSyncExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleWatchlistRemoved(WatchlistItemRemovedEvent event) {
        if (event == null || event.userId() == null) {
            return;
        }
        try {
            taskService.scheduleRecompute(event.userId(), RecommendationRecomputeTriggeredBy.WATCHLIST_REMOVE);
        } catch (RuntimeException ex) {
            log.error("Failed to enqueue recommendation recompute after watchlist remove userId={}", event.userId(), ex);
        }
    }
}
