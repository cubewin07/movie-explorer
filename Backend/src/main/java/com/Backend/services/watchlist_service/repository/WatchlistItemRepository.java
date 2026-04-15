package com.Backend.services.watchlist_service.repository;

import com.Backend.services.watchlist_service.model.WatchlistItem;
import com.Backend.services.watchlist_service.model.WatchlistItemId;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, WatchlistItemId> {
	@EntityGraph(attributePaths = {"watchlist", "watchlist.user"})
	List<WatchlistItem> findAllByFilm_InternalId(Long filmInternalId);
}
