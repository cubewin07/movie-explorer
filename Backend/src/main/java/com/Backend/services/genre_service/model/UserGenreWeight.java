package com.Backend.services.genre_service.model;

import com.Backend.services.FilmType;
import com.Backend.services.user_service.model.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
    name = "user_genre_weight",
    indexes = {
        @Index(name = "idx_user_genre_weight_user", columnList = "user_id"),
        @Index(name = "idx_user_genre_weight_genre", columnList = "genre_id")
    }
)
public class UserGenreWeight {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private UserGenreWeightId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("genreId")
    @JoinColumn(name = "genre_id", nullable = false)
    @JsonIgnore
    private Genre genre;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private FilmType type;

    private Long weight;
}
