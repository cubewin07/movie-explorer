package com.Backend.services.watchlist_service.model;

import com.Backend.services.user_service.model.User;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor
@Table(
    name = "watchlist",
    indexes = {
        @Index(name = "idx_watchlist_user_id", columnList = "user_id"),
    }
)
public class Watchlist {

    @Id
    @EqualsAndHashCode.Include
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonBackReference(value = "user-watchlist")
    private User user;

    @OneToMany(mappedBy = "watchlist", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private Set<WatchlistItem> items = new HashSet<>();

    public void setUser(User user) {
        this.user = user;
        if(user.getWatchlist() != this) {
            user.setWatchlist(this);
        }
    }

    public void addItem(WatchlistItem item) {
        this.items.add(item);
    }

    public void removeItem(WatchlistItem item) {
        this.items.remove(item);
    }
}
