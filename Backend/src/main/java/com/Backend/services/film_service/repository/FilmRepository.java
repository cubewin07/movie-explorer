package com.Backend.services.film_service.repository;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FilmRepository extends JpaRepository<Film, Long> {
    Optional<Film> findByFilmIdAndType(Long filmId, FilmType type);

    List<Film> findByFilmIdInAndType(Collection<Long> filmIds, FilmType type);

    @EntityGraph(attributePaths = {"directors", "keywords", "genres"})
    List<Film> findAllByInternalIdIn(Collection<Long> internalIds);
}
