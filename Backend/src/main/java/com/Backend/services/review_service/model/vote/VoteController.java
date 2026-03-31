package com.Backend.services.review_service.model.vote;

import com.Backend.exception.ErrorRes;
import com.Backend.services.user_service.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/votes")
@RequiredArgsConstructor
@Tag(name = "Votes", description = "Review vote APIs")
public class VoteController {
    private final VoteService voteService;

    @PostMapping()
    @Operation(summary = "Create or update vote")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Vote updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid vote request", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "Review or user not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Map<String, String>> updateVote(
            @RequestBody VoteStateRequest request,
            @AuthenticationPrincipal User user
    ) {
        voteService.updateVote(request, user);
        return ResponseEntity.ok(Map.of("message", "Succeed"));
    }
}
