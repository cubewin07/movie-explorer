package com.Backend.services.recommendation_service.controller;

import com.Backend.exception.ErrorRes;
import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.TmdbSimilarItem;
import com.Backend.services.recommendation_service.model.RecommendationResultDTO;
import com.Backend.services.recommendation_service.service.RecommendationService;
import com.Backend.services.recommendation_service.service.RecommendationQueryService;
import com.Backend.services.user_service.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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

    private final RecommendationQueryService recommendationQueryService;
    private final RecommendationService recommendationService;

    @GetMapping()
    @Operation(summary = "Get current user ranked recommendations")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Recommendations returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<List<RecommendationResultDTO>> getRecommendations(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(recommendationQueryService.getRecommendationsForUser(user));
    }

    @GetMapping("/similar")
    @Operation(summary = "Get similar films and schedule recommendation sync after delay")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Similar films returned successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<List<TmdbSimilarItem>> getSimilarAndScheduleRecommendationSync(
            @RequestParam("filmId") Long filmId,
            @RequestParam("type") FilmType type,
            @AuthenticationPrincipal User user
    ) {
        if (filmId == null || type == null || user == null) {
            throw new IllegalArgumentException("filmId and type are required");
        }
        return ResponseEntity.ok(recommendationService.getSimilarAndScheduleRecommendationSync(filmId, type));
    }
}
