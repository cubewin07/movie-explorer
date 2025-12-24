package com.Backend.services.review_service.model;

import lombok.Data;
import lombok.Builder;

@Data
@Builder
public class EpisodeMetadata {
    private String episodeId;
    private Integer SeasonNumber;
    private Integer episodeNumber;
}
