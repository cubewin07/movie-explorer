package com.Backend.services.watchlist_service.service;

import com.Backend.services.user_service.model.User;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
import com.Backend.services.watchlist_service.model.WatchlistDTO;
import com.Backend.services.watchlist_service.model.WatchlistType;
import com.Backend.services.watchlist_service.repository.WatchlistRepository;
import com.Backend.exception.WatchlistNotFoundException;
import com.Backend.exception.DuplicateWatchlistItemException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;

    @Cacheable(value = "watchlist", key = "#user.id")
    public WatchlistDTO getWatchlist(User user) {
        log.debug("Fetching watchlist for user id={} from database", user.getId());
        Watchlist watchlist = watchlistRepository.findByUserId(user.getId())
                .orElseThrow(() -> new WatchlistNotFoundException("Watchlist for user id " + user.getId() + " not found"));
        Set<Long> seriesIds = user.getWatchlist().getSeriesId() != null
                ? new HashSet<>(user.getWatchlist().getSeriesId())
                : new HashSet<>();

        Set<Long> moviesIds = user.getWatchlist().getMoviesId() != null
                ? new HashSet<>(user.getWatchlist().getMoviesId())
                : new HashSet<>();

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

        Set<Long> IdSet;
        if(posting.type().equals(WatchlistType.MOVIE))
            IdSet = watchlist.getMoviesId();
        else
            IdSet = watchlist.getSeriesId();

        // Checking duplication
        if(IdSet.contains(posting.id())) {
            throw new DuplicateWatchlistItemException("Movie/Series already in watchlist");
        }

        IdSet.add(posting.id());
        watchlistRepository.save(watchlist);
        log.info("Movie id: {} successfully added to watchlist for user: {}", posting.id(), user.getUsername());
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "watchlist", key = "#user.id"),
        @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    public void removeFromWatchlist(WatchlistPosting posting, User user) {
        Long id = posting.id();

        Watchlist watchlist = watchlistRepository.findByUserId(user.getId())
                .orElseThrow(() -> new WatchlistNotFoundException("Watchlist for user id " + user.getId() + " not found"));

        Set<Long> IdSet;
        if(posting.type().equals(WatchlistType.MOVIE))
            IdSet = watchlist.getMoviesId();
        else
            IdSet = watchlist.getSeriesId();

        boolean removed = IdSet.remove(id);

        if (removed) {
            watchlistRepository.save(watchlist);
            log.info("Movie id: {} successfully removed from watchlist for user: {}", id, user.getUsername());
        } else {
            log.warn("Movie id: {} was not found in watchlist for user: {}", id, user.getUsername());
        }
    }
}