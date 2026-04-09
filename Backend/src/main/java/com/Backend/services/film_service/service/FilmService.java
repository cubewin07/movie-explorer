package com.Backend.services.film_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.TmdbFilmResponse;
import com.Backend.services.film_service.repository.FilmRepository;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class FilmService {

    private final FilmRepository filmRepository;
    private final TmdbClient tmdbClient;

    public Optional<Film> findByTmdbIdAndType(Long tmdbId, FilmType type) {
        return filmRepository.findByFilmIdAndType(tmdbId, type);
    }

    public List<Film> findByTmdbIdsAndType(Collection<Long> tmdbIds, FilmType type) {
        if (type == null || tmdbIds == null || tmdbIds.isEmpty()) {
            return List.of();
        }
        return filmRepository.findByFilmIdInAndType(tmdbIds, type);
    }

    @Transactional
    public Film getOrCreateFilm(Long tmdbId, FilmType type) {
        Optional<Film> existing = filmRepository.findByFilmIdAndType(tmdbId, type);
        if (existing.isPresent()) {
            return existing.get();
        }
        TmdbFilmResponse response = tmdbClient.fetchFilmDetails(tmdbId, type);
        Film film = buildFilm(tmdbId, type, response);
        try {
            return filmRepository.save(Objects.requireNonNull(film, "film"));
        } catch (DataIntegrityViolationException ex) {
            log.debug("Film already inserted for tmdbId={} type={}", tmdbId, type);
            return filmRepository.findByFilmIdAndType(tmdbId, type)
                    .orElseThrow(() -> ex);
        }
    }

    @Transactional
    public Film getOrCreateFilmFromTmdbSnapshot(
            Long tmdbId,
            FilmType type,
            String title,
            String dateValue,
            String backgroundImg
    ) {
        Optional<Film> existing = filmRepository.findByFilmIdAndType(tmdbId, type);
        if (existing.isPresent()) {
            return existing.get();
        }

        Film film = Film.builder()
                .filmId(tmdbId)
                .type(type)
                .title(title)
                .rating(null)
                .date(parseDate(dateValue))
                .backgroundImg(backgroundImg)
                .build();

        try {
            return filmRepository.save(Objects.requireNonNull(film, "film"));
        } catch (DataIntegrityViolationException ex) {
            log.debug("Film already inserted for tmdbId={} type={}", tmdbId, type);
            return filmRepository.findByFilmIdAndType(tmdbId, type)
                    .orElseThrow(() -> ex);
        }
    }

    @Transactional
    public Film getOrRefreshFilmFromTmdbDetails(Long tmdbId, FilmType type) {
        TmdbFilmResponse response = tmdbClient.fetchFilmDetails(tmdbId, type);
        Optional<Film> existing = filmRepository.findByFilmIdAndType(tmdbId, type);
        if (existing.isPresent()) {
            Film film = existing.get();
            applyResponseToFilm(film, response);
            return filmRepository.save(Objects.requireNonNull(film, "film"));
        }

        Film film = buildFilm(tmdbId, type, response);
        try {
            return filmRepository.save(Objects.requireNonNull(film, "film"));
        } catch (DataIntegrityViolationException ex) {
            log.debug("Film already inserted for tmdbId={} type={}", tmdbId, type);
            return filmRepository.findByFilmIdAndType(tmdbId, type)
                    .orElseThrow(() -> ex);
        }
    }

    private Film buildFilm(Long tmdbId, FilmType type, TmdbFilmResponse response) {
        String title = response != null && StringUtils.hasText(response.getTitle())
                ? response.getTitle()
                : response != null ? response.getName() : null;
        LocalDate releaseDate = parseDate(response != null ? response.getReleaseDate() : null);
        if (releaseDate == null) {
            releaseDate = parseDate(response != null ? response.getFirstAirDate() : null);
        }
        return Film.builder()
                .filmId(tmdbId)
                .type(type)
                .title(title)
                .rating(response != null ? response.getVoteAverage() : null)
                .date(releaseDate)
                .backgroundImg(response != null ? response.getBackdropPath() : null)
                .build();
    }

    private void applyResponseToFilm(Film film, TmdbFilmResponse response) {
        if (film == null || response == null) {
            return;
        }

        String title = StringUtils.hasText(response.getTitle()) ? response.getTitle() : response.getName();
        if (StringUtils.hasText(title)) {
            film.setTitle(title);
        }

        film.setRating(response.getVoteAverage());

        LocalDate releaseDate = parseDate(response.getReleaseDate());
        if (releaseDate == null) {
            releaseDate = parseDate(response.getFirstAirDate());
        }
        film.setDate(releaseDate);

        if (StringUtils.hasText(response.getBackdropPath()) || film.getBackgroundImg() == null) {
            film.setBackgroundImg(response.getBackdropPath());
        }
    }

    private LocalDate parseDate(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDate.parse(value);
        } catch (DateTimeParseException ex) {
            return null;
        }
    }
}
