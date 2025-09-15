package com.Backend.services.watchlist_service.model;

import com.Backend.services.user_service.model.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
public class Watchlist {

    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @ElementCollection
    @CollectionTable(name = "watchlist_series", joinColumns = @JoinColumn(name = "watchlist_id"))
    @Column(name = "series_id")
    private List<Long> seriesId;

    @ElementCollection
    @CollectionTable(name = "watchlist_movies", joinColumns = @JoinColumn(name = "watchlist_id"))
    @Column(name = "movie_id")
    private List<Long> moviesId;
}
