package com.Backend.services.watchlist_service.repository;

import com.Backend.services.watchlist_service.model.WatchlistItem;
import com.Backend.services.watchlist_service.model.WatchlistItemId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WatchlistItemRepository extends JpaRepository<WatchlistItem, WatchlistItemId> {}
