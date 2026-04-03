package com.Backend.services.keyword_service.repository;

import com.Backend.services.keyword_service.model.KeywordSyncTask;
import com.Backend.services.keyword_service.model.KeywordSyncTaskStatus;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface KeywordSyncTaskRepository extends JpaRepository<KeywordSyncTask, Long> {
    Optional<KeywordSyncTask> findByFilmInternalId(Long filmInternalId);

    List<KeywordSyncTask> findTop50ByStatusInAndNextRetryAtLessThanEqualOrderByNextRetryAtAsc(
            Collection<KeywordSyncTaskStatus> statuses,
            Instant nextRetryAt
    );
}
