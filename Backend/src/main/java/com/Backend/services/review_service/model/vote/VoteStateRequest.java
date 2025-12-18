package com.Backend.services.review_service.model.vote;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoteStateRequest {
    private int value;
    private Long reviewId;
}
