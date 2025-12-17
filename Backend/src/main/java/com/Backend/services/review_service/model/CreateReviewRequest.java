package com.Backend.services.review_service.model;

import com.Backend.services.FilmType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreateReviewRequest {
    private String content;
    private long filmId;
    private FilmType type;
    private long replyToId;
}
