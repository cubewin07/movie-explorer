package com.Backend.services.watchlist_service.repository;

import com.Backend.services.watchlist_service.model.WatchlistItem;
import com.Backend.services.watchlist_service.model.WatchlistItemId;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, WatchlistItemId> {
	long countByWatchlist_UserId(Long userId);

	@Query("select wi.id.filmInternalId from WatchlistItem wi where wi.id.watchlistId = :userId")
	List<Long> findFilmInternalIdsByUserId(@Param("userId") Long userId);

	@EntityGraph(attributePaths = {"watchlist", "watchlist.user"})
	List<WatchlistItem> findAllByFilm_InternalId(Long filmInternalId);
}
