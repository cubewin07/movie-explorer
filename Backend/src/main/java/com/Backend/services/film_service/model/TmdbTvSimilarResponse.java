package com.Backend.services.film_service.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbTvSimilarResponse {

    private List<TvSimilarItem> results = new ArrayList<>();

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class TvSimilarItem {
        private Long id;
        private String name;

        @JsonProperty("first_air_date")
        private String firstAirDate;

        @JsonProperty("vote_average")
        private Double voteAverage;

        @JsonProperty("backdrop_path")
        private String backdropPath;
    }
}
