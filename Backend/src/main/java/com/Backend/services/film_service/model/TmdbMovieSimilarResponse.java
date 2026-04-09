package com.Backend.services.film_service.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbMovieSimilarResponse {

    private List<MovieSimilarItem> results = new ArrayList<>();

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class MovieSimilarItem {
        private Long id;
        private String title;

        @JsonProperty("release_date")
        private String releaseDate;

        @JsonProperty("vote_average")
        private Double voteAverage;

        @JsonProperty("backdrop_path")
        private String backdropPath;
    }
}
