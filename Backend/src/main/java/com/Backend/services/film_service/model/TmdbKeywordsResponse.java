package com.Backend.services.film_service.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbKeywordsResponse {
    private Long id;
    private List<KeywordItem> keywords = new ArrayList<>();
    private List<KeywordItem> results = new ArrayList<>();

    public List<KeywordItem> getAllKeywords() {
        if (keywords != null && !keywords.isEmpty()) {
            return keywords;
        }
        if (results != null) {
            return results;
        }
        return List.of();
    }

    @Data
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class KeywordItem {
        private Long id;
        private String name;
    }
}
