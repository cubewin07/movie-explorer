package com.Backend.services.recommendation_service.snapshot.repository;

import com.Backend.services.recommendation_service.snapshot.model.UserRecomputeTask;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface UserRecomputeTaskRepository extends JpaRepository<UserRecomputeTask, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select t from UserRecomputeTask t where t.scheduledAt <= :now order by t.scheduledAt asc")
    List<UserRecomputeTask> findDueForUpdate(@Param("now") Instant now, Pageable pageable);
}
