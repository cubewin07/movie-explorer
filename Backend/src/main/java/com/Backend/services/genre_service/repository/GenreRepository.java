package com.Backend.services.genre_service.repository;

import com.Backend.services.genre_service.model.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GenreRepository extends JpaRepository<Genre, Long> {
	boolean existsByFilms_InternalId(Long filmInternalId);
}
