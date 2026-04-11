package com.Backend.services.recommendation_service.model;

import com.Backend.services.FilmType;
import java.time.LocalDate;

public record RecommendationResultDTO(
        Long internalFilmId,
        Long filmId,
        FilmType type,
        String title,
        Double rating,
        LocalDate date,
        String backgroundImg,
        Double score,
        Double keywordScore,
        Double genreScore,
        Double languageScore,
        Double directorScore,
        Double ratingScore,
        Double recencyBoost
) {
}
