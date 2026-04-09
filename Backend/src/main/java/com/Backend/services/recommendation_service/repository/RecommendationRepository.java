package com.Backend.services.recommendation_service.repository;

import com.Backend.services.recommendation_service.model.Recommendation;
import com.Backend.services.recommendation_service.model.RecommendationId;
import java.util.Collection;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecommendationRepository extends JpaRepository<Recommendation, RecommendationId> {

    @Query("select r.id.recommendedFilmId from Recommendation r "
            + "where r.id.filmId = :filmId and r.id.recommendedFilmId in :recommendedFilmIds")
    Set<Long> findExistingRecommendedFilmIds(
            @Param("filmId") Long filmId,
            @Param("recommendedFilmIds") Collection<Long> recommendedFilmIds
    );
}
