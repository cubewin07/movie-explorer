package com.Backend.services.recommendation_service.model;

import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.time.Instant;
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
    name = "recommendation",
    indexes = {
        @Index(name = "idx_recommendation_film", columnList = "film_id"),
        @Index(name = "idx_recommendation_recommended_film", columnList = "recommended_film_id")
    }
)
public class Recommendation {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private RecommendationId id;

    @CreationTimestamp
    @Column(name = "ingested_at", nullable = false, updatable = false)
    private Instant ingestedAt;
}
