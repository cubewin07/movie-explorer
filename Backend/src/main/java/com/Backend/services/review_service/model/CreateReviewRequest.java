package com.Backend.services.review_service.model;

import com.Backend.services.FilmType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReviewRequest {
    private String content;
    private long filmId;
    private FilmType type;
    private EpisodeMetadata episodeMetadata;
}
