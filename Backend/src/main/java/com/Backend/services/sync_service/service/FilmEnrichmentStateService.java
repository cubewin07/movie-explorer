package com.Backend.services.sync_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.FilmEnrichmentStatus;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.sync_service.model.SyncCategory;
import jakarta.annotation.PostConstruct;
import java.time.Duration;
import java.time.Instant;
import java.util.EnumSet;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FilmEnrichmentStateService {

    private static final EnumSet<SyncCategory> ENRICHMENT_CATEGORIES =
            EnumSet.of(SyncCategory.ENRICHMENT);

    private final FilmRepository filmRepository;

    @Value("${recommendation.enrichment.lease-duration-ms:60000}")
    private long leaseDurationMs;

    @Value("${recommendation.enrichment.ttl-ms:604800000}")
    private long enrichmentTtlMs;

    @Value("${sync.retry.fixed-delay-ms:30000}")
    private long schedulerTickMs;

    @PostConstruct
    void validateConfiguration() {
        if (leaseDurationMs <= Math.max(0L, schedulerTickMs)) {
            throw new IllegalStateException(
                    "recommendation.enrichment.lease-duration-ms must be greater than sync.retry.fixed-delay-ms"
            );
        }
    }

    public boolean managesCategory(SyncCategory category) {
        return category != null && ENRICHMENT_CATEGORIES.contains(category);
    }

    @Transactional
    public Film prepareFilm(Film film) {
        if (film == null || film.getInternalId() == null) {
            return null;
        }

        Long filmInternalId = film.getInternalId();
        Film managedFilm = filmRepository.findById(filmInternalId).orElse(null);
        if (managedFilm == null) {
            return null;
        }

        if (managedFilm.getEnrichmentStatus() == null) {
            managedFilm.setEnrichmentStatus(FilmEnrichmentStatus.PENDING);
        }

        if (shouldReenqueue(managedFilm)) {
            resetForReenrichment(managedFilm);
            filmRepository.flush();
        }

        return managedFilm;
    }

    @Transactional
    public boolean tryAcquireLease(Film film) {
        if (film == null || film.getInternalId() == null) {
            return false;
        }

        Instant now = Instant.now();
        Instant leaseExpiresAt = now.plusMillis(resolveLeaseDurationMs());
        int updated = filmRepository.claimEnrichmentLease(
                film.getInternalId(),
                FilmEnrichmentStatus.PENDING,
                FilmEnrichmentStatus.IN_PROGRESS,
                now,
                leaseExpiresAt
        );
        if (updated < 1) {
            return false;
        }

        film.setEnrichmentStatus(FilmEnrichmentStatus.IN_PROGRESS);
        film.setLeaseExpiresAt(leaseExpiresAt);
        return true;
    }

    @Transactional
    public void releaseAfterSuccess(Film film) {
        Film managedFilm = prepareFilm(film);
        if (managedFilm == null) {
            return;
        }

        managedFilm.setLeaseExpiresAt(null);
        if (allEnrichmentStagesCompleted(managedFilm)) {
            managedFilm.setEnrichmentStatus(FilmEnrichmentStatus.DONE);
            managedFilm.setEnrichedAt(Instant.now());
            return;
        }

        managedFilm.setEnrichmentStatus(FilmEnrichmentStatus.PENDING);
        managedFilm.setEnrichedAt(null);
    }

    @Transactional
    public void releaseAfterFailure(Film film) {
        Film managedFilm = prepareFilm(film);
        if (managedFilm == null) {
            return;
        }

        managedFilm.setEnrichmentStatus(FilmEnrichmentStatus.PENDING);
        managedFilm.setLeaseExpiresAt(null);
        if (!allEnrichmentStagesCompleted(managedFilm)) {
            managedFilm.setEnrichedAt(null);
        }
    }

    private boolean shouldReenqueue(Film film) {
        if (film.getEnrichmentStatus() != FilmEnrichmentStatus.DONE || film.getEnrichedAt() == null) {
            return false;
        }
        Instant cutoff = Instant.now().minusMillis(resolveTtlMs());
        return film.getEnrichedAt().isBefore(cutoff);
    }

    private void resetForReenrichment(Film film) {
        film.setCreditsSyncCompleted(false);
        film.setKeywordSyncCompleted(false);
        film.setGenreSyncCompleted(false);
        film.setEnrichmentStatus(FilmEnrichmentStatus.PENDING);
        film.setLeaseExpiresAt(null);
        film.setEnrichedAt(null);
    }

    private boolean allEnrichmentStagesCompleted(Film film) {
        return Boolean.TRUE.equals(film.getCreditsSyncCompleted())
                && Boolean.TRUE.equals(film.getKeywordSyncCompleted())
                && Boolean.TRUE.equals(film.getGenreSyncCompleted());
    }

    private long resolveLeaseDurationMs() {
        return Math.max(Duration.ofSeconds(1).toMillis(), leaseDurationMs);
    }

    private long resolveTtlMs() {
        return Math.max(Duration.ofMinutes(1).toMillis(), enrichmentTtlMs);
    }
}
