package com.Backend.services.keyword_service.repository;

import com.Backend.services.keyword_service.model.Keyword;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KeywordRepository extends JpaRepository<Keyword, Long> {
	boolean existsByFilms_InternalId(Long filmInternalId);
}
