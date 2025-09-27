package com.Backend.services.watchlist_service.service;

import com.Backend.services.user_service.model.User;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
import com.Backend.services.watchlist_service.model.WatchlistType;
import com.Backend.services.watchlist_service.repository.WatchlistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;

    public Watchlist getWatchlist(User user) {
        return watchlistRepository.findByUserId(user.getId()).orElseThrow();
    }

    public void addToWatchlist(WatchlistPosting posting, User user) {
        Watchlist watchlist = getWatchlist(user);

        Set<Long> IdSet;
        if(posting.type().equals(WatchlistType.MOVIE))
            IdSet = watchlist.getMoviesId();
        else
            IdSet = watchlist.getSeriesId();

        // Checking duplication
        if(IdSet.contains(posting.id())) {
            throw new IllegalArgumentException("Movie/Series already in watchlist");
        }

        IdSet.add(posting.id());
        watchlistRepository.save(watchlist);
        log.info("Movie id: {} successfully added to watchlist for user: {}", posting.id(), user.getUsername());
    }

    public void addSeriesToWatchlist(Long seriesId, User user) {
        Watchlist watchlist = getWatchlist(user);
        watchlist.getSeriesId().add(seriesId);
        watchlistRepository.save(watchlist);
        log.info("Series id: {} successfully added to watchlist for user: {}", seriesId, user.getUsername());
    }

    public void removeMovieFromWatchlist(Long movieId, User user) {
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
