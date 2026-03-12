package com.Backend.services.watchlist_service.model;

import com.Backend.services.film_service.model.Film;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(
    name = "watchlist_items",
    indexes = {
        @Index(name = "idx_watchlist_items_watchlist", columnList = "watchlist_id"),
        @Index(name = "idx_watchlist_items_film", columnList = "internal_film_id")
    }
)
public class WatchlistItem {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private WatchlistItemId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("watchlistId")
    @JoinColumn(name = "watchlist_id", nullable = false)
    @JsonIgnore
    private Watchlist watchlist;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("filmInternalId")
    @JoinColumn(name = "internal_film_id", nullable = false)
    @JsonIgnore
    private Film film;
}
