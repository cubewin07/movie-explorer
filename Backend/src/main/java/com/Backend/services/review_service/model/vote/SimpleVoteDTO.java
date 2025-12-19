package com.Backend.services.review_service.model.vote;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SimpleVoteDTO {
    private Long id;
    private int value;
    private Long reviewId;
}
