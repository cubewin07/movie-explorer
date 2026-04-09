package com.Backend.services.sync_service.repository;

import com.Backend.services.sync_service.model.SyncCategory;
import com.Backend.services.sync_service.model.SyncTask;
import com.Backend.services.sync_service.model.SyncTaskStatus;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SyncTaskRepository extends JpaRepository<SyncTask, Long> {
    Optional<SyncTask> findByFilmInternalIdAndSyncCategory(Long filmInternalId, SyncCategory syncCategory);

    List<SyncTask> findTop50ByStatusInAndNextRetryAtLessThanEqualOrderByNextRetryAtAsc(
            Collection<SyncTaskStatus> statuses,
            Instant nextRetryAt
    );
}
