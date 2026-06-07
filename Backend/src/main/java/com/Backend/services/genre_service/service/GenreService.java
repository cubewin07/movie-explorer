package com.Backend.services.genre_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.TmdbFilmResponse;
import com.Backend.services.film_service.model.TmdbFilmResponse.GenreItem;
import com.Backend.services.film_service.service.TmdbClient;
import com.Backend.services.genre_service.model.Genre;
import com.Backend.services.genre_service.repository.GenreRepository;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class GenreService {

    private final GenreRepository genreRepository;
    private final TmdbClient tmdbClient;

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
