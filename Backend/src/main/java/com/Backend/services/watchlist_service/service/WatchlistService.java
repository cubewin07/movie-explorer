package com.Backend.services.watchlist_service.service;

import com.Backend.services.user_service.model.User;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;

    public Watchlist getWatchlist(User user) {
        log.info("Retrieving watchlist for user id: {}", user.getId());
        Watchlist watchlist = watchlistRepository.findByUserId(user.getId()).orElseThrow();
        log.info("Successfully retrieved watchlist for user: {} with {} movies and {} series", 
                user.getUsername(), watchlist.getMoviesId().size(), watchlist.getSeriesId().size());
        return watchlist;
    }

    public void addMovieToWatchlist(Long movieId, User user) {
        log.info("Adding movie id: {} to watchlist for user: {}", movieId, user.getUsername());
        Watchlist watchlist = getWatchlist(user);
        watchlist.getMoviesId().add(movieId);
        watchlistRepository.save(watchlist);
        log.info("Movie id: {} successfully added to watchlist for user: {}", movieId, user.getUsername());
    }

    public void addSeriesToWatchlist(Long seriesId, User user) {
        log.info("Adding series id: {} to watchlist for user: {}", seriesId, user.getUsername());
        Watchlist watchlist = getWatchlist(user);
        watchlist.getSeriesId().add(seriesId);
        watchlistRepository.save(watchlist);
        log.info("Series id: {} successfully added to watchlist for user: {}", seriesId, user.getUsername());
    }

    public void removeMovieFromWatchlist(Long movieId, User user) {
        log.info("Removing movie id: {} from watchlist for user: {}", movieId, user.getUsername());
        Watchlist watchlist = getWatchlist(user);
        boolean removed = watchlist.getMoviesId().remove(movieId);
        if (removed) {
            watchlistRepository.save(watchlist);
            log.info("Movie id: {} successfully removed from watchlist for user: {}", movieId, user.getUsername());
        } else {
            log.warn("Movie id: {} was not found in watchlist for user: {}", movieId, user.getUsername());
        }
    }

    public void removeSeriesFromWatchlist(Long seriesId, User user) {
        log.info("Removing series id: {} from watchlist for user: {}", seriesId, user.getUsername());
        Watchlist watchlist = getWatchlist(user);
        boolean removed = watchlist.getSeriesId().remove(seriesId);
        if (removed) {
            watchlistRepository.save(watchlist);
            log.info("Series id: {} successfully removed from watchlist for user: {}", seriesId, user.getUsername());
        } else {
            log.warn("Series id: {} was not found in watchlist for user: {}", seriesId, user.getUsername());
        }
    }

}
