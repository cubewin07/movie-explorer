package com.Backend.services.director_service.repository;

import com.Backend.services.director_service.model.DirectorSyncTask;
import com.Backend.services.director_service.model.DirectorSyncTaskStatus;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DirectorSyncTaskRepository extends JpaRepository<DirectorSyncTask, Long> {
    Optional<DirectorSyncTask> findByFilmInternalId(Long filmInternalId);

    List<DirectorSyncTask> findTop50ByStatusInAndNextRetryAtLessThanEqualOrderByNextRetryAtAsc(
            Collection<DirectorSyncTaskStatus> statuses,
            Instant nextRetryAt
    );
}
