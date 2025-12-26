package com.Backend.services.review_service.model.vote;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SimpleVoteDTO {
    private Long id;
    private int value;
    private Long reviewId;
}
