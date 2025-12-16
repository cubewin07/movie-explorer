package com.Backend.services.review_service.controller;

import com.Backend.services.review_service.model.Review;
import com.Backend.services.user_service.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/reviews")
public class ReviewController {

    @GetMapping()
    public ResponseEntity<List<Review>> getReviews(
            @RequestParam("filmId") Long filmId,
            @RequestParam("type") String type,
            @AuthenticationPrincipal User user){
        return ResponseEntity.ok(null);
    }

    @GetMapping("/reply/{reviewId}")
    public ResponseEntity<List<Review>> getReviewById(@RequestParam("reviewId") Long reviewId, @AuthenticationPrincipal User user){
        return ResponseEntity.ok(null);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Review>> getReviewsByUser(@RequestParam("userId") Long userId, @AuthenticationPrincipal User user){
        return ResponseEntity.ok(null);
    }


}
