package com.Backend.services.film_service.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbFilmResponse {
    private Long id;
    private String title;
    private String name;

    @JsonProperty("vote_average")
    private Double voteAverage;

    @JsonProperty("release_date")
    private String releaseDate;

    @JsonProperty("first_air_date")
    private String firstAirDate;

    @JsonProperty("backdrop_path")
    private String backdropPath;

    private List<GenreItem> genres = new ArrayList<>();

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GenreItem {
        private Long id;
        private String name;
    }
}
