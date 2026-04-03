package com.Backend.services.watchlist_service.service;

import com.Backend.exception.DuplicateWatchlistItemException;
import com.Backend.exception.WatchlistNotFoundException;
import com.Backend.services.FilmType;
import com.Backend.services.director_service.service.DirectorService;
import com.Backend.services.director_service.service.DirectorSyncTaskService;
import com.Backend.services.director_service.service.DirectorWeightService;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.service.FilmService;
import com.Backend.services.keyword_service.service.KeywordService;
import com.Backend.services.keyword_service.service.KeywordSyncTaskService;
import com.Backend.services.keyword_service.service.KeywordWeightService;
import com.Backend.services.user_service.model.User;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.model.WatchlistDTO;
import com.Backend.services.watchlist_service.model.WatchlistItem;
import com.Backend.services.watchlist_service.model.WatchlistItemId;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
import com.Backend.services.watchlist_service.repository.WatchlistItemRepository;
import com.Backend.services.watchlist_service.repository.WatchlistRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final WatchlistItemRepository watchlistItemRepository;
    private final FilmService filmService;
    private final DirectorService directorService;
    private final DirectorSyncTaskService directorSyncTaskService;
    private final DirectorWeightService directorWeightService;
    private final KeywordService keywordService;
    private final KeywordSyncTaskService keywordSyncTaskService;
    private final KeywordWeightService keywordWeightService;

    @Cacheable(value = "watchlist", key = "#user.id")
    @Transactional
    public WatchlistDTO getWatchlist(User user) {
        log.debug("Fetching watchlist for user id={} from database", user.getId());
        Watchlist watchlist = watchlistRepository.findByUserId(user.getId())
                .orElseThrow(() -> new WatchlistNotFoundException("Watchlist for user id " + user.getId() + " not found"));
        Set<Long> seriesIds = new HashSet<>();
        Set<Long> moviesIds = new HashSet<>();
        if (watchlist.getItems() != null) {
            for (WatchlistItem item : watchlist.getItems()) {
                Film film = item.getFilm();
                if (film == null) {
                    continue;
                }
                if (film.getType() == FilmType.MOVIE) {
                    moviesIds.add(film.getFilmId());
                } else if (film.getType() == FilmType.SERIES) {
                    seriesIds.add(film.getFilmId());
                }
            }
        }
        return new WatchlistDTO(moviesIds, seriesIds);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "watchlist", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    public void addToWatchlist(WatchlistPosting posting, User user) {
        Watchlist watchlist = watchlistRepository.findByUserId(user.getId())
                .orElseThrow(() -> new WatchlistNotFoundException("Watchlist for user id " + user.getId() + " not found"));

        Film film = filmService.getOrCreateFilm(posting.id(), posting.type());
        boolean wasDirectorSynced = Boolean.TRUE.equals(film.getDirectorSyncCompleted());
        boolean directorSyncSucceeded = false;
        try {
            directorService.syncDirectorsForFilm(posting.id(), posting.type(), film);
            film.setDirectorSyncCompleted(true);
            directorSyncSucceeded = true;
        } catch (RuntimeException ex) {
            if (!wasDirectorSynced) {
                directorSyncTaskService.enqueueRetry(film, posting.id(), ex);
            }
            log.warn("Failed to sync directors for tmdbId={} type={}", posting.id(), posting.type(), ex);
        }

        boolean wasKeywordSynced = Boolean.TRUE.equals(film.getKeywordSyncCompleted());
        boolean keywordSyncSucceeded = false;
        try {
            keywordService.syncKeywordsForFilm(posting.id(), posting.type(), film);
            film.setKeywordSyncCompleted(true);
            keywordSyncSucceeded = true;
        } catch (RuntimeException ex) {
            if (!wasKeywordSynced) {
                keywordSyncTaskService.enqueueRetry(film, posting.id(), ex);
            }
            log.warn("Failed to sync keywords for tmdbId={} type={}", posting.id(), posting.type(), ex);
        }

        WatchlistItemId itemId = new WatchlistItemId(watchlist.getUserId(), film.getInternalId());

        if (watchlistItemRepository.existsById(itemId)) {
            throw new DuplicateWatchlistItemException("Movie/Series already in watchlist");
        }

        WatchlistItem item = WatchlistItem.builder()
                .id(itemId)
                .watchlist(watchlist)
                .film(film)
                .build();
        watchlistItemRepository.save(Objects.requireNonNull(item, "watchlist item"));

        if (!wasDirectorSynced && directorSyncSucceeded) {
            directorWeightService.backfillWeightsForFilm(film);
        } else if (Boolean.TRUE.equals(film.getDirectorSyncCompleted())) {
            directorWeightService.adjustWeightsForFilm(watchlist.getUser(), film, 1L);
        }

        if (!wasKeywordSynced && keywordSyncSucceeded) {
            keywordWeightService.backfillWeightsForFilm(film);
        } else if (Boolean.TRUE.equals(film.getKeywordSyncCompleted())) {
            keywordWeightService.adjustWeightsForFilm(watchlist.getUser(), film, 1L);
        }
        log.info("Film tmdbId: {} successfully added to watchlist for user: {}", posting.id(), user.getUsername());
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "watchlist", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    public void removeFromWatchlist(WatchlistPosting posting, User user) {
        Watchlist watchlist = watchlistRepository.findByUserId(user.getId())
                .orElseThrow(() -> new WatchlistNotFoundException("Watchlist for user id " + user.getId() + " not found"));
        Film film = filmService.findByTmdbIdAndType(posting.id(), posting.type())
                .orElse(null);
        if (film == null) {
            log.warn("Film tmdbId: {} was not found in watchlist for user: {}", posting.id(), user.getUsername());
            return;
        }

        WatchlistItemId itemId = new WatchlistItemId(watchlist.getUserId(), film.getInternalId());
        boolean removed = false;
        if (watchlist.getItems() != null) {
            removed = watchlist.getItems().removeIf(item -> itemId.equals(item.getId()));
            // Using orphanRemoval because it updates the watchlist items in memory and avoids an extra delete query, but we still need to call save to update the watchlist's last modified time
            // Using deleteById only deletes the item in the database but doesn't update the in-memory watchlist collection, which can lead to stale data being returned until the cache expires
        }
        if (removed) {
            watchlistRepository.save(watchlist);
            if (Boolean.TRUE.equals(film.getDirectorSyncCompleted())) {
                directorWeightService.adjustWeightsForFilm(watchlist.getUser(), film, -1L);
            }
            if (Boolean.TRUE.equals(film.getKeywordSyncCompleted())) {
                keywordWeightService.adjustWeightsForFilm(watchlist.getUser(), film, -1L);
            }
            log.info("Film tmdbId: {} successfully removed from watchlist for user: {}", posting.id(), user.getUsername());
        } else {
            log.warn("Film tmdbId: {} was not found in watchlist for user: {}", posting.id(), user.getUsername());
        }
    }
}