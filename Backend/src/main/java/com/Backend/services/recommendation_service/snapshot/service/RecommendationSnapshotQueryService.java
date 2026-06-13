package com.Backend.services.recommendation_service.snapshot.service;

import com.Backend.services.recommendation_service.model.RecommendationResultDTO;
import com.Backend.services.recommendation_service.snapshot.model.UserRecommendationSnapshotRow;
import com.Backend.services.recommendation_service.snapshot.model.UserRecommendationSnapshotState;
import com.Backend.services.recommendation_service.snapshot.repository.UserRecommendationSnapshotRowRepository;
import com.Backend.services.recommendation_service.snapshot.repository.UserRecommendationSnapshotStateRepository;
import com.Backend.services.user_service.model.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecommendationSnapshotQueryService {

    private final UserRecommendationSnapshotStateRepository stateRepository;
    private final UserRecommendationSnapshotRowRepository rowRepository;

    @Transactional(readOnly = true)
    public List<RecommendationResultDTO> getRecommendationsForUser(User user) {
        if (user == null || user.getId() == null) {
            return List.of();
        }

        UserRecommendationSnapshotState state = stateRepository.findById(user.getId()).orElse(null);
        if (state == null || state.getActiveVersion() <= 0) {
            return List.of();
        }

        List<UserRecommendationSnapshotRow> rows = rowRepository
                .findAllByUserIdAndSnapshotVersionOrderByRankAsc(user.getId(), state.getActiveVersion());
        if (rows == null || rows.isEmpty()) {
            return List.of();
        }

        return rows.stream()
                .map(this::toDto)
                .toList();
    }

    private RecommendationResultDTO toDto(UserRecommendationSnapshotRow row) {
        return new RecommendationResultDTO(
                row.getFilmInternalId(),
                row.getTmdbId(),
                row.getType(),
                row.getTitle(),
                row.getRating(),
                row.getDate(),
                row.getBackgroundImg(),
                row.getScore(),
                row.getKeywordScore(),
                row.getGenreScore(),
                row.getLanguageScore(),
                row.getDirectorScore(),
                row.getRatingScore(),
                row.getRecencyBoost()
        );
    }
}
