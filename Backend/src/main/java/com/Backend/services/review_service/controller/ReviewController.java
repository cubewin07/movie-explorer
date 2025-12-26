package com.Backend.services.review_service.controller;

import com.Backend.services.FilmType;
import com.Backend.services.review_service.model.CreateReplyRequest;
import com.Backend.services.review_service.model.CreateReviewRequest;
import com.Backend.services.review_service.model.ReviewsDTO;
import com.Backend.services.review_service.service.ReviewService;
import com.Backend.services.user_service.model.User;
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
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping()
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
    public ResponseEntity<Page<ReviewsDTO>> getRepliesById(
            @RequestParam("reviewId") Long reviewId,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @AuthenticationPrincipal User user){
        Page<ReviewsDTO> replies = reviewService.getRepliesByReviewId(reviewId, page, user);
        return ResponseEntity.ok(replies);
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

    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteReview(
            @RequestParam("reviewId") Long reviewId,
            @AuthenticationPrincipal User user){
        reviewService.deleteReview(reviewId, user);
        return ResponseEntity.ok().build();
    }


}
