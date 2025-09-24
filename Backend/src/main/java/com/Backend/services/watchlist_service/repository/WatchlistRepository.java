package com.Backend.services.watchlist_service.repository;

import com.Backend.services.watchlist_service.model.Watchlist;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<Watchlist, Long> {

    @EntityGraph(attributePaths = {"seriesId", "moviesId"})
    Optional<Watchlist> findByUserId(Long userId);

    @Query("SELECT w FROM Watchlist w JOIN FETCH w.moviesId m WHERE m = :movieId")
    List<Watchlist> findByMoviesId(@Param("movieId")Long movieId);

    @Query("SELECT w FROM Watchlist w JOIN FETCH w.seriesId s WHERE s = :seriesId")
    List<Watchlist> findBySeriesId(@Param("seriesId")Long seriesId);
}