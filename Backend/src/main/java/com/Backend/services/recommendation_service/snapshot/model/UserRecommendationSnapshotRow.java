package com.Backend.services.recommendation_service.snapshot.model;

import com.Backend.services.FilmType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(
    name = "user_recommendation_snapshot",
    uniqueConstraints = {
        @UniqueConstraint(
            name = "uq_user_snapshot_rank",
            columnNames = {"user_id", "snapshot_version", "rank"}
        ),
        @UniqueConstraint(
            name = "uq_user_snapshot_film",
            columnNames = {"user_id", "snapshot_version", "film_internal_id"}
        )
    },
    indexes = {
        @Index(name = "idx_user_snapshot_user_version", columnList = "user_id, snapshot_version"),
        @Index(name = "idx_user_snapshot_user_version_rank", columnList = "user_id, snapshot_version, rank")
    }
)
public class UserRecommendationSnapshotRow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "snapshot_version", nullable = false)
    private long snapshotVersion;

    @Column(name = "rank", nullable = false)
    private int rank;

    @Column(name = "film_internal_id", nullable = false)
    private Long filmInternalId;

    @Column(name = "tmdb_id", nullable = false)
    private Long tmdbId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 16)
    private FilmType type;

    @Column(name = "title")
    private String title;

    @Column(name = "rating")
    private Double rating;

    @Column(name = "date")
    private LocalDate date;

    @Column(name = "background_img")
    private String backgroundImg;

    @Column(name = "score", nullable = false)
    private double score;

    @Column(name = "keyword_score", nullable = false)
    private double keywordScore;

    @Column(name = "genre_score", nullable = false)
    private double genreScore;

    @Column(name = "language_score", nullable = false)
    private double languageScore;

    @Column(name = "director_score", nullable = false)
    private double directorScore;

    @Column(name = "rating_score", nullable = false)
    private double ratingScore;

    @Column(name = "recency_boost", nullable = false)
    private double recencyBoost;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
