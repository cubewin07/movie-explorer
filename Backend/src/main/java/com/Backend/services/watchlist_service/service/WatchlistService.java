package com.Backend.services.watchlist_service.service;

import com.Backend.exception.DuplicateWatchlistItemException;
import com.Backend.exception.WatchlistNotFoundException;
import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.service.FilmService;
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
        boolean removed = watchlistItemRepository.existsById(itemId);
        if (removed) {
            watchlistItemRepository.deleteById(itemId);
            log.info("Film tmdbId: {} successfully removed from watchlist for user: {}", posting.id(), user.getUsername());
        } else {
            log.warn("Film tmdbId: {} was not found in watchlist for user: {}", posting.id(), user.getUsername());
        }
    }
}