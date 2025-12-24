package com.Backend.services.review_service.model;

import com.Backend.services.user_service.model.DTO.SimpleUserDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.Backend.services.FilmType;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewsDTO {
    private Long id;
    private String content;
    private Long replyCount;
    private SimpleUserDTO user;
    private Boolean likedByMe;
    private Boolean disLikedByMe;
    private Long score;
    private Integer episodeSeasonNumber;
    private Integer episodeNumber;
    private LocalDateTime createdAt;

    public static ReviewsDTO fromReview(Review review, Boolean likedByMe, Boolean disLikedByMe) {
        Long userId = review.getUser().getId();
        String userEmail = review.getUser().getEmail();
        String userName = review.getUser().getRealUsername();
        Boolean isSeries = review.getType() == FilmType.SERIES;
        SimpleUserDTO simpleUserDTO = new SimpleUserDTO(userId, userEmail, userName);
        return ReviewsDTO.builder()
                .id(review.getId())
                .content(review.getContent())
                .replyCount(review.getReplyCount())
                .user(simpleUserDTO)
                .likedByMe(likedByMe)
                .score(review.getScore())
                .disLikedByMe(disLikedByMe)
                .episodeNumber(isSeries ? review.getEpisodeNumber() : null)
                .episodeSeasonNumber(isSeries ? review.getEpisodeSeasonNumber() : null)
                .createdAt(review.getCreatedAt())
                .build();
    }
}
