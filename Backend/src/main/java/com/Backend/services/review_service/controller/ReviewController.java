package com.Backend.services.review_service.controller;

import com.Backend.services.FilmType;
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
            @RequestParam(name = "page", defaultValue = "0") int page){

        return ResponseEntity.ok(reviewService.getReviewsByFilmId(filmId, type, page));
    }

    @GetMapping("/reply/{reviewId}")
    public ResponseEntity<List<Review>> getRepliesById(
            @RequestParam("reviewId") Long reviewId,
            @AuthenticationPrincipal User user){
        return ResponseEntity.ok(null);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getReviewsByUser(
            @RequestParam("userId") Long userId,
            @AuthenticationPrincipal User user){
        return ResponseEntity.ok(null);
    }

    @PostMapping()
    public ResponseEntity<Review> createReview(
            @RequestBody Review review,
            @AuthenticationPrincipal User user){
        return ResponseEntity.ok(null);
    }

    @DeleteMapping("/delete/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @RequestParam("reviewId") Long reviewId,
            @AuthenticationPrincipal User user){
        return ResponseEntity.ok().build();
    }


}
