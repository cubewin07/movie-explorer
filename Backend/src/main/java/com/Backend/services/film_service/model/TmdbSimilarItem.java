package com.Backend.services.film_service.model;

public record TmdbSimilarItem(
        Long tmdbId,
        String title,
        String dateValue,
        String backgroundImg
) {
}
