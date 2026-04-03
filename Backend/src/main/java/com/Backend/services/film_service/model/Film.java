package com.Backend.services.film_service.model;

import com.Backend.services.FilmType;
import com.Backend.services.director_service.model.Director;
import com.Backend.services.genre_service.model.Genre;
import com.Backend.services.keyword_service.model.Keyword;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(
    name = "film",
    indexes = {
        @Index(name = "idx_film_tmdb_type", columnList = "film_id, type")
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "uq_film_tmdb_type", columnNames = {"film_id", "type"})
    }
)
public class Film {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "internal_id")
    @EqualsAndHashCode.Include
    private Long internalId;

    @Column(name = "film_id", nullable = false)
    private Long filmId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private FilmType type;

    @Column(name = "title")
    private String title;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "background_img")
    private String backgroundImg;

    @Column(name = "director_sync_completed", nullable = false)
    @Builder.Default
    private Boolean directorSyncCompleted = false;

    @Column(name = "keyword_sync_completed", nullable = false)
    @Builder.Default
    private Boolean keywordSyncCompleted = false;

    @Column(name = "genre_sync_completed", nullable = false)
    @Builder.Default
    private Boolean genreSyncCompleted = false;

    @ManyToMany(mappedBy = "films")
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private Set<Director> directors = new HashSet<>();

    @ManyToMany(mappedBy = "films")
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private Set<Keyword> keywords = new HashSet<>();

    @ManyToMany(mappedBy = "films")
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private Set<Genre> genres = new HashSet<>();
}
