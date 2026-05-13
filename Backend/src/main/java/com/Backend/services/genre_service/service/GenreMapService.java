package com.Backend.services.genre_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.TmdbFilmResponse;
import com.Backend.services.film_service.model.TmdbGenreListResponse;
import com.Backend.services.film_service.service.TmdbClient;
import com.Backend.services.genre_service.model.Genre;
import jakarta.annotation.PostConstruct;
import java.util.Collections;
import java.util.EnumMap;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class GenreMapService {

    private final TmdbClient tmdbClient;

    // Structural decision: immutable startup cache to enforce "no per-film TMDB calls".
    private volatile Map<FilmType, Map<Integer, Genre>> byType = Map.of();

    @PostConstruct
    void init() {
        Map<FilmType, Map<Integer, Genre>> built = new EnumMap<>(FilmType.class);

        // Structural decision: TMDB "tv" maps to our FilmType.SERIES enum.
        built.put(FilmType.MOVIE, fetchGenreMapOrEmpty(FilmType.MOVIE));
        built.put(FilmType.SERIES, fetchGenreMapOrEmpty(FilmType.SERIES));

        built.replaceAll((k, v) -> Collections.unmodifiableMap(v));
        this.byType = Collections.unmodifiableMap(built);

        log.info(
                "GenreMapService initialized movieGenres={} tvGenres={} (tv maps to FilmType.SERIES)",
                this.byType.getOrDefault(FilmType.MOVIE, Map.of()).size(),
                this.byType.getOrDefault(FilmType.SERIES, Map.of()).size()
        );
    }

    /**
     * Resolve a TMDB genre id to a detached {@link Genre} seed.
     *
     * <p>Structural decision: the returned Genre is NOT a managed entity instance; it is used as a value object
     * to avoid per-film TMDB calls while still reusing the existing Genre entity shape.
     */
    public Optional<Genre> resolve(Integer tmdbGenreId, FilmType type) {
        if (tmdbGenreId == null || type == null) {
            return Optional.empty();
        }
        Map<Integer, Genre> map = byType.get(type);
        if (map == null || map.isEmpty()) {
            return Optional.empty();
        }
        return Optional.ofNullable(map.get(tmdbGenreId));
    }

    private Map<Integer, Genre> fetchGenreMapOrEmpty(FilmType type) {
        try {
            TmdbGenreListResponse response = tmdbClient.fetchGenreList(type);
            List<TmdbFilmResponse.GenreItem> genres = response != null ? response.getGenres() : null;
            if (genres == null || genres.isEmpty()) {
                return Map.of();
            }

            Map<Integer, Genre> result = new HashMap<>(Math.max(8, genres.size()));
            for (TmdbFilmResponse.GenreItem item : genres) {
                if (item == null || item.getId() == null || !StringUtils.hasText(item.getName())) {
                    continue;
                }

                int id = item.getId().intValue();

                result.put(
                        id,
                        Genre.builder()
                                .genreId((long) id)
                                .name(item.getName().trim())
                                .type(type)
                                .build()
                );
            }
            return result;
        } catch (Exception ex) {
            // Structural decision: startup must not crash on TMDB failures; seeding becomes a no-op.
            log.error("Failed to fetch TMDB genre list for type={} - continuing with empty map", type, ex);
            return Map.of();
        }
    }
}
