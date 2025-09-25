package com.Backend.services.watchlist_service.model;

import com.Backend.services.user_service.model.User;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
public class Watchlist {

    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @ElementCollection
    @CollectionTable(name = "watchlist_series", joinColumns = @JoinColumn(name = "watchlist_id"))
    @Column(name = "series_id")
    private Set<Long> seriesId = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "watchlist_movies", joinColumns = @JoinColumn(name = "watchlist_id"))
    @Column(name = "movie_id")
    private Set<Long> moviesId = new HashSet<>();

    public void setUser(User user) {
        this.user = user;
        if(user.getWatchlist() != this) {
            user.setWatchlist(this);
        }
    }

    public void addSeriesId(Long seriesId) {
        this.seriesId.add(seriesId);
    }

    public void addMoviesId(Long moviesId) {
        this.moviesId.add(moviesId);
    }
}
