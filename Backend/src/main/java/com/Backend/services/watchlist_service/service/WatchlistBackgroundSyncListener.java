package com.Backend.services.watchlist_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.sync_service.model.SyncAttemptResult;
import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.service.FilmSyncTaskService;
import com.Backend.services.user_service.model.User;
import com.Backend.services.watchlist_service.event.WatchlistItemAddedEvent;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.repository.WatchlistRepository;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class WatchlistBackgroundSyncListener {

    private final WatchlistRepository watchlistRepository;
    private final FilmRepository filmRepository;
    private final FilmSyncTaskService filmSyncTaskService;

    @Value("${watchlist.sync.apply-heavy-backfill:false}")
    private boolean applyHeavyBackfill;

    @Async("watchlistSyncExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleWatchlistItemAdded(WatchlistItemAddedEvent event) {
        if (event == null || event.userId() == null || event.filmInternalId() == null) {
            return;
        }
        Long filmInternalId = event.filmInternalId();

        try {
            Watchlist watchlist = watchlistRepository.findByUserId(event.userId()).orElse(null);
            if (watchlist == null || watchlist.getUser() == null) {
                log.warn("Skipping background sync after add-to-watchlist because user/watchlist is missing userId={}",
                        event.userId());
                return;
            }

            Film film = filmRepository.findById(Objects.requireNonNull(filmInternalId, "filmInternalId")).orElse(null);
            if (film == null) {
                log.warn("Skipping background sync after add-to-watchlist because film is missing userId={} filmInternalId={}",
                        event.userId(), filmInternalId);
                return;
            }

            Long tmdbId = event.tmdbId() != null ? event.tmdbId() : film.getFilmId();
            if (tmdbId == null || film.getType() == null) {
                log.warn("Skipping background sync after add-to-watchlist because tmdbId/type is missing userId={} filmInternalId={}",
                    event.userId(), filmInternalId);
                return;
            }

            User user = watchlist.getUser();

            SyncAttemptResult enrichmentSync = safeSync(film, tmdbId, SyncCategory.ENRICHMENT, user.getId());
            SyncAttemptResult recommendationSync = safeSync(film, tmdbId, SyncCategory.RECOMMENDATION, user.getId());

            logCategorySummary(user.getId(), film.getInternalId(), tmdbId, SyncCategory.ENRICHMENT, enrichmentSync);
            logCategorySummary(user.getId(), film.getInternalId(), tmdbId, SyncCategory.RECOMMENDATION, recommendationSync);
        } catch (RuntimeException ex) {
            log.error(
                    "Background sync crashed after add-to-watchlist userId={} filmInternalId={} tmdbId={}",
                    event.userId(),
                    filmInternalId,
                    event.tmdbId(),
                    ex
            );
        }
    }

    private SyncAttemptResult safeSync(Film film, Long tmdbId, SyncCategory category, Long userId) {
        try {
            return filmSyncTaskService.syncNowOrQueue(film, tmdbId, category);
        } catch (RuntimeException ex) {
            log.error(
                    "Background sync crashed for category={} userId={} filmInternalId={} tmdbId={}",
                    category,
                    userId,
                    film != null ? film.getInternalId() : null,
                    tmdbId,
                    ex
            );
            return SyncAttemptResult.failedWithoutRetry(false, "ASYNC_SYNC_CRASH", ex.getMessage());
        }
    }

    private void logCategorySummary(
            Long userId,
            Long filmInternalId,
            Long tmdbId,
            SyncCategory category,
            SyncAttemptResult result
    ) {
        if (result == null) {
            return;
        }

        if (result.failedPermanently()) {
            log.error(
                    "Background sync permanently failed category={} userId={} filmInternalId={} tmdbId={} code={}",
                    category,
                    userId,
                    filmInternalId,
                    tmdbId,
                    result.errorCode()
            );
            return;
        }

        if (!result.syncSucceeded()) {
            log.warn(
                    "Background sync deferred category={} userId={} filmInternalId={} tmdbId={} code={}",
                    category,
                    userId,
                    filmInternalId,
                    tmdbId,
                    result.errorCode()
            );
        }
    }
}
