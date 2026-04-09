package com.Backend.services.recommendation_service.model;

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
public class RecommendationId implements Serializable {
    private static final long serialVersionUID = 1L;

    @Column(name = "film_id")
    private Long filmId;

    @Column(name = "recommended_film_id")
    private Long recommendedFilmId;
}
