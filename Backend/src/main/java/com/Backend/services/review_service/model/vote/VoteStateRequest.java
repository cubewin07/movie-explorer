package com.Backend.services.review_service.model.vote;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class VoteStateRequest {
    private int value;
    private Long reviewId;
}
