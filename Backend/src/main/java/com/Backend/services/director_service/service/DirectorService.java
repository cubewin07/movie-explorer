package com.Backend.services.director_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.director_service.model.Director;
import com.Backend.services.director_service.repository.DirectorRepository;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.TmdbCreditsResponse;
import com.Backend.services.film_service.model.TmdbCreditsResponse.CrewMember;
import com.Backend.services.film_service.service.TmdbClient;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class DirectorService {

    private static final String DIRECTOR_JOB = "Director";

    private final DirectorRepository directorRepository;
    private final TmdbClient tmdbClient;

    @Transactional
    public void syncDirectorsForFilm(Long tmdbId, FilmType type, Film film) {
        TmdbCreditsResponse credits = tmdbClient.fetchCredits(tmdbId, type);
        if (credits == null || credits.getCrew() == null) {
            return;
        }
        List<CrewMember> directors = credits.getCrew().stream()
                .filter(member -> member != null && DIRECTOR_JOB.equalsIgnoreCase(member.getJob()))
                .toList();
        if (directors.isEmpty()) {
            return;
        }
        for (CrewMember directorInfo : directors) {
            if (directorInfo.getId() == null || !StringUtils.hasText(directorInfo.getName())) {
                continue;
            }
            Director director = getOrCreateDirector(directorInfo.getId(), directorInfo.getName());
            linkDirectorToFilm(director, film);
        }
    }

    @Transactional
    public Director getOrCreateDirector(Long directorId, String name) {
        Optional<Director> existing = directorRepository.findById(directorId);
        if (existing.isPresent()) {
            Director director = existing.get();
            if (StringUtils.hasText(name) && !name.equals(director.getName())) {
                director.setName(name);
            }
            return director;
        }
        Director director = Director.builder()
                .directorId(directorId)
                .name(name)
                .build();
        return directorRepository.save(director);
    }

    @Transactional
    public void linkDirectorToFilm(Director director, Film film) {
        if (director == null || film == null) {
            return;
        }
        if (!director.getFilms().contains(film)) {
            director.getFilms().add(film);
        }
        if (film.getDirectors() != null && !film.getDirectors().contains(director)) {
            film.getDirectors().add(director);
        }
        directorRepository.save(director);
    }
}
