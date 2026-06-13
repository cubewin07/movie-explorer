package com.Backend.services.film_service.repository;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.FilmEnrichmentStatus;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FilmRepository extends JpaRepository<Film, Long> {
    Optional<Film> findByFilmIdAndType(Long filmId, FilmType type);

    List<Film> findByFilmIdInAndType(Collection<Long> filmIds, FilmType type);

    @EntityGraph(attributePaths = {"filmRoles", "filmRoles.credit", "filmRoles.role", "keywords", "genres"})
    List<Film> findAllByInternalIdIn(Collection<Long> internalIds);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("""
            update Film f
               set f.enrichmentStatus = :inProgress,
                   f.leaseExpiresAt = :leaseExpiresAt
             where f.internalId = :filmInternalId
               and (
                   f.enrichmentStatus = :pending
                   or (
                       f.enrichmentStatus = :inProgress
                       and (f.leaseExpiresAt is null or f.leaseExpiresAt < :now)
                   )
               )
            """)
    int claimEnrichmentLease(
            @Param("filmInternalId") Long filmInternalId,
            @Param("pending") FilmEnrichmentStatus pending,
            @Param("inProgress") FilmEnrichmentStatus inProgress,
            @Param("now") Instant now,
            @Param("leaseExpiresAt") Instant leaseExpiresAt
    );
}
