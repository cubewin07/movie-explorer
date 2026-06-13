package com.Backend.services.film_service.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.util.ArrayList;
import java.util.List;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TmdbGenreListResponse {

    // Structural decision: reuse the existing `TmdbFilmResponse.GenreItem` shape (id + name).
    private List<TmdbFilmResponse.GenreItem> genres = new ArrayList<>();
}
