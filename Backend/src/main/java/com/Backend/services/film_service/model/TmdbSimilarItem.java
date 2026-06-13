package com.Backend.services.film_service.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record TmdbSimilarItem(
                Long tmdbId,
                String title,
                String dateValue,
                String backgroundImg,
                Double voteAverage,
                String originalLanguage,
                // Structural decision: keep the TMDB payload field name for compatibility when this record is (de)serialized.
                @JsonProperty("genre_ids") List<Integer> genreIds
) {
        // Structural decision: nullable-safe normalization avoids scattered null checks at call sites.
        public TmdbSimilarItem {
                genreIds = genreIds == null ? List.of() : List.copyOf(genreIds);
        }
}
