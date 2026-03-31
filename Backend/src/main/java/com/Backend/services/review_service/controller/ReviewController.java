package com.Backend.services.review_service.controller;

import com.Backend.exception.ErrorRes;
import com.Backend.services.FilmType;
import com.Backend.services.review_service.model.CreateReplyRequest;
import com.Backend.services.review_service.model.CreateReviewRequest;
import com.Backend.services.review_service.model.ReviewsDTO;
import com.Backend.services.review_service.service.ReviewService;
import com.Backend.services.user_service.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Review and reply APIs")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping()
    @Operation(summary = "Get reviews by film")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reviews returned successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized for personalized data", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "Film not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
        })
    public ResponseEntity<Page<ReviewsDTO>> getReviews(
            @RequestParam("filmId") Long filmId,
            @RequestParam("type") FilmType type,
            @RequestParam(name = "seasonNumber", required = false) Integer seasonNumber,
            @RequestParam(name = "episodeNumber", required = false) Integer episodeNumber,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @AuthenticationPrincipal User user){

         List<ReviewsDTO> reviews = reviewService.getReviewsByFilmId(filmId, type, seasonNumber, episodeNumber, page, user);
         Long totalElements = reviewService.countReviewsByFilmIdNoPage(filmId, type, seasonNumber, episodeNumber);
         return ResponseEntity.ok(new PageImpl<>(reviews, PageRequest.of(page, 10), totalElements));
    }

    @GetMapping("/reply")
    @Operation(summary = "Get replies by review")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Replies returned successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "Review not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
        })
    public ResponseEntity<Page<ReviewsDTO>> getRepliesById(
            @RequestParam("reviewId") Long reviewId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @AuthenticationPrincipal User user){
        List<ReviewsDTO> replies = reviewService.getRepliesByReviewId(reviewId, page, user);
        Long totalElements = reviewService.countRepliesByReviewIdNoPage(reviewId);
        return ResponseEntity.ok(new PageImpl<>(replies, PageRequest.of(page, 20), totalElements)); 
    }

    @GetMapping("/user")
    @Operation(summary = "Get current user reviews")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User reviews returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
        })
    public ResponseEntity<List<ReviewsDTO>> getReviewsByUser(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @AuthenticationPrincipal User user){
        return ResponseEntity.ok(reviewService.getReviewsByUser(user, page));
    }

    @PostMapping()
    @Operation(summary = "Create review")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Review created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid review request", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
        })
    public ResponseEntity<ReviewsDTO> createReview(
            @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal User user){
        return ResponseEntity.ok(reviewService.createReview(request, user));
    }

    @PostMapping("/reply")
    @Operation(summary = "Create reply to a review")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Reply created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid reply request", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "Review not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
        })
    public ResponseEntity<ReviewsDTO> createReply(
            @RequestBody CreateReplyRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.createReply(request, user));
    }

    @DeleteMapping("/delete")
    @Operation(summary = "Delete review")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Review deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "403", description = "Not authorized to delete this review", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "Review not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
        })
    public ResponseEntity<Void> deleteReview(
            @RequestParam("reviewId") Long reviewId,
            @AuthenticationPrincipal User user){
        reviewService.deleteReview(reviewId, user);
        return ResponseEntity.ok().build();
    }


}
