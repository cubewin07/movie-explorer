package com.Backend.services.recommendation_service.controller;

import com.Backend.exception.ErrorRes;
import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.TmdbSimilarItem;
import com.Backend.services.recommendation_service.model.RecommendationResultDTO;
import com.Backend.services.recommendation_service.service.RecommendationService;
import com.Backend.services.recommendation_service.service.RecommendationQueryService;
import com.Backend.services.user_service.model.User;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Duration;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/recommendations")
@RequiredArgsConstructor
@Tag(name = "Recommendations", description = "Personalized recommendation APIs")
public class RecommendationController {

    private static final String RECOMMENDATION_ENDPOINT_LATENCY_METRIC = "recommendation.endpoint.latency";

    private final RecommendationQueryService recommendationQueryService;
    private final RecommendationService recommendationService;
    private final MeterRegistry meterRegistry;

    @GetMapping()
    @Operation(summary = "Get current user ranked recommendations")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Recommendations returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<List<RecommendationResultDTO>> getRecommendations(@AuthenticationPrincipal User user) {
        Timer.Sample sample = Timer.start(meterRegistry);
        boolean success = false;
        try {
            ResponseEntity<List<RecommendationResultDTO>> response = ResponseEntity.ok(recommendationQueryService.getRecommendationsForUser(user));
            success = true;
            return response;
        } finally {
            sample.stop(Timer.builder(RECOMMENDATION_ENDPOINT_LATENCY_METRIC)
                    .description("Latency histogram for GET /recommendations")
                    .tag("endpoint", "get_recommendations")
                    .tag("outcome", success ? "success" : "error")
                    .publishPercentileHistogram()
                    .serviceLevelObjectives(
                            Duration.ofMillis(50),
                            Duration.ofMillis(100),
                            Duration.ofMillis(250),
                            Duration.ofMillis(500),
                            Duration.ofSeconds(1),
                            Duration.ofSeconds(2)
                    )
                    .register(meterRegistry));
        }
    }

    @GetMapping("/similar")
    @Operation(summary = "Get similar films and schedule recommendation sync after delay (public)")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Similar films returned successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<List<TmdbSimilarItem>> getSimilarAndScheduleRecommendationSync(
            @RequestParam("filmId") Long filmId,
            @RequestParam("type") FilmType type
    ) {
        if (filmId == null || type == null) {
            throw new IllegalArgumentException("filmId and type are required");
        }
        return ResponseEntity.ok(recommendationService.getSimilarAndScheduleRecommendationSync(filmId, type));
    }
}
