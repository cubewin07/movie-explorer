package com.Backend.services.film_service.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbCreditsResponse {
    private List<CrewMember> crew = new ArrayList<>();

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class CrewMember {
        private Long id;
        private String name;
        private String job;
        @JsonProperty("known_for_department")
        private String department;
    }
}
