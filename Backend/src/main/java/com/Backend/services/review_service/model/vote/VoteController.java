package com.Backend.services.review_service.model.vote;

import com.Backend.services.user_service.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/votes")
@RequiredArgsConstructor
public class VoteController {
    private final VoteService voteService;

    @PostMapping("/like")
    public ResponseEntity<Map<String, String>> likeReview(
            @RequestBody VoteStateRequest request,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(Map.of("message", "You liked the review with id: " + reviewId));
    }
}
