package com.Backend.services.recommendation_service.snapshot.repository;

import com.Backend.services.recommendation_service.snapshot.model.UserRecommendationSnapshotRow;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRecommendationSnapshotRowRepository extends JpaRepository<UserRecommendationSnapshotRow, Long> {

    List<UserRecommendationSnapshotRow> findAllByUserIdAndSnapshotVersionOrderByRankAsc(Long userId, long snapshotVersion);

    void deleteAllByUserIdAndSnapshotVersion(Long userId, long snapshotVersion);

    void deleteAllByUserIdAndSnapshotVersionLessThan(Long userId, long snapshotVersion);
}
