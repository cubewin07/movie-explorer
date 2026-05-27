package com.Backend.services.recommendation_service.snapshot.repository;

import com.Backend.services.recommendation_service.snapshot.model.UserRecommendationSnapshotState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

public interface UserRecommendationSnapshotStateRepository extends JpaRepository<UserRecommendationSnapshotState, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from UserRecommendationSnapshotState s where s.userId = :userId")
    UserRecommendationSnapshotState findByUserIdForUpdate(@Param("userId") Long userId);
}
