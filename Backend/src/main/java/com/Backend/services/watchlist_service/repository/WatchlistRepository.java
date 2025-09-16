package com.Backend.services.watchlist_service.repository;

import com.Backend.services.watchlist_service.model.Watchlist;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {
    @EntityGraph(attributePaths = {"seriesId", "moviesId"})
    Optional<Watchlist> findByUserId(Long userId);
}
