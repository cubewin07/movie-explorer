package com.Backend.services.review_service.controller;

import com.Backend.services.FilmType;
import com.Backend.services.review_service.model.CreateReplyRequest;
import com.Backend.services.review_service.model.CreateReviewRequest;
import com.Backend.services.review_service.model.Review;
import com.Backend.services.review_service.model.ReviewsDTO;
import com.Backend.services.review_service.service.ReviewService;
import com.Backend.services.user_service.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping()
    public ResponseEntity<List<ReviewsDTO>> getReviews(
            @RequestParam("filmId") Long filmId,
            @RequestParam("type") FilmType type,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @AuthenticationPrincipal User user){

        return ResponseEntity.ok(reviewService.getReviewsByFilmId(filmId, type, page, user));
    }

    @GetMapping("/reply/{reviewId}")
    public ResponseEntity<List<ReviewsDTO>> getRepliesById(
            @RequestParam("reviewId") Long reviewId,
            @AuthenticationPrincipal User user){
        return ResponseEntity.ok(reviewService.getRepliesByReviewId(reviewId));
    }

    @GetMapping("/user")
    public ResponseEntity<List<ReviewsDTO>> getReviewsByUser(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @AuthenticationPrincipal User user){
        return ResponseEntity.ok(reviewService.getReviewsByUser(user, page));
    }

    @PostMapping()
    public ResponseEntity<ReviewsDTO> createReview(
            @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal User user){
        return ResponseEntity.ok(reviewService.createReview(request, user));
    }

    @PostMapping("/reply")
    public ResponseEntity<ReviewsDTO> createReply(
            @RequestBody CreateReplyRequest request,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(reviewService.createReply(request, user));
    }

    @DeleteMapping("/delete/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @RequestParam("reviewId") Long reviewId,
            @AuthenticationPrincipal User user){
        reviewService.deleteReview(reviewId, user);
        return ResponseEntity.ok().build();
    }


}
