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

    @PostMapping()
    public ResponseEntity<Map<String, String>> likeReview(
            @RequestBody VoteStateRequest request,
            @AuthenticationPrincipal User user
    ) {
        voteService.updateVote(request, user);
        return ResponseEntity.ok(Map.of("message", "Succeed"));
    }
}
