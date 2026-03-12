package com.Backend.services.watchlist_service.repository;

import com.Backend.services.watchlist_service.model.Watchlist;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    @EntityGraph(attributePaths = {"items", "items.film"})
    Optional<Watchlist> findByUserId(Long userId);

    @Query(value = "SELECT COUNT(*) FROM watchlist_items wi JOIN film f ON wi.internal_film_id = f.internal_id WHERE f.type = 'MOVIE'", nativeQuery = true)
    long countAllWatchlistedMovies();

    @Query(value = "SELECT COUNT(*) FROM watchlist_items wi JOIN film f ON wi.internal_film_id = f.internal_id WHERE f.type = 'SERIES'", nativeQuery = true)
    long countAllWatchlistedSeries();
}
