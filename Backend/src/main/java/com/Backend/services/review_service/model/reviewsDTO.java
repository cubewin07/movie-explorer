package com.Backend.services.review_service.model;

import com.Backend.services.user_service.model.DTO.SimpleUserDTO;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class reviewsDTO {
    private Long id;
    private String content;
    private long replyCount;
    private SimpleUserDTO user;
    private LocalDateTime createdAt;

    public reviewsDTO fromReview(Review review) {
        Long userId = review.getUser().getId();
        String userEmail = review.getUser().getEmail();
        String userName = review.getUser().getRealUsername();
        SimpleUserDTO simpleUserDTO = new SimpleUserDTO(userId, userEmail, userName);
        return reviewsDTO.builder()
                .id(review.getId())
                .content(review.getContent())
                .replyCount(review.getReplyCount())
                .user(simpleUserDTO)
                .createdAt(review.getCreatedAt())
                .build();
    }
}
