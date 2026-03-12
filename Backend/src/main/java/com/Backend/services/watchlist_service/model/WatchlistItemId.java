package com.Backend.services.watchlist_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Embeddable
public class WatchlistItemId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "watchlist_id")
    private Long watchlistId;

    @Column(name = "internal_film_id")
    private Long filmInternalId;
}
