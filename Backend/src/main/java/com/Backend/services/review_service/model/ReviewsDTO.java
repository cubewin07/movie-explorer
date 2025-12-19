package com.Backend.services.review_service.model;

import com.Backend.services.user_service.model.DTO.SimpleUserDTO;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewsDTO {
    private Long id;
    private String content;
    private long replyCount;
    private SimpleUserDTO user;
    private Boolean likedByMe;
    private Boolean disLikedByMe;
    private Long score;
    private LocalDateTime createdAt;

    public static ReviewsDTO fromReview(Review review, Boolean likedByMe, Boolean disLikedByMe) {
        Long userId = review.getUser().getId();
        String userEmail = review.getUser().getEmail();
        String userName = review.getUser().getRealUsername();
        SimpleUserDTO simpleUserDTO = new SimpleUserDTO(userId, userEmail, userName);
        return ReviewsDTO.builder()
                .id(review.getId())
                .content(review.getContent())
                .replyCount(review.getReplyCount())
                .user(simpleUserDTO)
                .likedByMe(likedByMe)
                .score(review.getScore())
                .disLikedByMe(disLikedByMe)
                .createdAt(review.getCreatedAt())
                .build();
    }
}
