package com.Backend.services.genre_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.TmdbFilmResponse;
import com.Backend.services.film_service.model.TmdbFilmResponse.GenreItem;
import com.Backend.services.film_service.service.TmdbClient;
import com.Backend.services.genre_service.model.Genre;
import com.Backend.services.genre_service.repository.GenreRepository;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;
    private final TmdbClient tmdbClient;
    private final GenreMapService genreMapService;
    private final JdbcTemplate jdbcTemplate;

    /**
     * Phase 1 ingestion: best-effort genre seeding from TMDB recommendation payload `genre_ids`.
     *
     * <p>Structural decision: this MUST be independent from film creation; we force a separate transaction so a
     * failure cannot roll back the Film row.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void syncGenresForFilm(Long filmInternalId, List<Integer> tmdbGenreIds, FilmType type) {
        if (filmInternalId == null || type == null || tmdbGenreIds == null || tmdbGenreIds.isEmpty()) {
            return;
        }

        // Structural decision: dedupe while preserving order; keep bounded and deterministic.
        Set<Integer> uniqueIds = new LinkedHashSet<>();
        for (Integer id : tmdbGenreIds) {
            if (id != null) {
                uniqueIds.add(id);
            }
        }
        if (uniqueIds.isEmpty()) {
            return;
        }

        List<Genre> resolvedSeeds = new ArrayList<>(uniqueIds.size());
        for (Integer tmdbGenreId : uniqueIds) {
            genreMapService.resolve(tmdbGenreId, type)
                    .ifPresentOrElse(
                            resolvedSeeds::add,
                            () -> log.debug("Skipping unknown TMDB genre id={} type={}", tmdbGenreId, type)
                    );
        }
        if (resolvedSeeds.isEmpty()) {
            return;
        }

        for (Genre seed : resolvedSeeds) {
            if (seed == null || seed.getGenreId() == null || !StringUtils.hasText(seed.getName())) {
                continue;
            }

            // Structural decision: reuse existing getOrCreateGenre to keep Genre table canonical.
            Genre persisted = getOrCreateGenre(seed.getGenreId(), seed.getName(), type);
            if (persisted == null || persisted.getGenreId() == null) {
                continue;
            }

            // Structural decision: insert into join table directly for idempotency and to avoid loading Film aggregates.
            jdbcTemplate.update(
                    "insert into film_genre (internal_film_id, genre_id) values (?, ?) on conflict do nothing",
                    filmInternalId,
                    persisted.getGenreId()
            );
        }
    }

    @Transactional
    public void syncGenresForFilm(Long tmdbId, FilmType type, Film film) {
        if (tmdbId == null || type == null || film == null) {
            return;
        }

        TmdbFilmResponse details = tmdbClient.fetchGenres(tmdbId, type);
        if (details == null || details.getGenres() == null || details.getGenres().isEmpty()) {
            return;
        }

        List<GenreItem> genres = details.getGenres();
        for (GenreItem genreInfo : genres) {
            if (genreInfo == null || genreInfo.getId() == null || !StringUtils.hasText(genreInfo.getName())) {
                continue;
            }
            Genre genre = getOrCreateGenre(genreInfo.getId(), genreInfo.getName(), type);
            linkGenreToFilm(genre, film);
        }
    }

    @Transactional
    public Genre getOrCreateGenre(Long genreId, String name, FilmType type) {
        Optional<Genre> existing = genreRepository.findById(Objects.requireNonNull(genreId, "genreId"));
        if (existing.isPresent()) {
            Genre genre = existing.get();
            if (StringUtils.hasText(name) && !name.equals(genre.getName())) {
                genre.setName(name);
            }
            if (genre.getType() == null && type != null) {
                genre.setType(type);
            }
            return genre;
        }

        Genre genre = Genre.builder()
                .genreId(genreId)
                .name(name)
                .type(type)
                .build();
        return genreRepository.save(Objects.requireNonNull(genre, "genre"));
    }

    @Transactional
    public void linkGenreToFilm(Genre genre, Film film) {
        if (genre == null || film == null) {
            return;
        }
        if (!genre.getFilms().contains(film)) {
            genre.getFilms().add(film);
        }
        if (film.getGenres() != null && !film.getGenres().contains(genre)) {
            film.getGenres().add(genre);
        }
        genreRepository.save(genre);
    }
}
