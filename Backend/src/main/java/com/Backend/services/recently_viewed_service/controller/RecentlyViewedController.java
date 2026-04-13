package com.Backend.services.recently_viewed_service.controller;

import com.Backend.exception.ErrorRes;
import com.Backend.services.FilmType;
import com.Backend.services.recently_viewed_service.model.RecentlyViewedDTO;
import com.Backend.services.recently_viewed_service.model.RecentlyViewedPosting;
import com.Backend.services.recently_viewed_service.service.RecentlyViewedService;
import com.Backend.services.user_service.model.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/recently-viewed")
@RequiredArgsConstructor
@Tag(name = "Recently Viewed", description = "Recently viewed films APIs")
public class RecentlyViewedController {

    private final RecentlyViewedService recentlyViewedService;

    @PostMapping
    @Operation(summary = "Add item to recently viewed")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Recently viewed item added"),
            @ApiResponse(responseCode = "400", description = "Invalid request payload", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Void> addRecentlyViewed(
            @RequestBody RecentlyViewedPosting posting,
            @AuthenticationPrincipal User user
    ) {
        if (posting == null || posting.type() == null || posting.id() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "type and id are required");
        }

        if (posting.type() != FilmType.MOVIE && posting.type() != FilmType.SERIES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "type must be MOVIE or SERIES");
        }

        recentlyViewedService.addRecentlyViewed(user, posting);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    @Operation(summary = "Get one combined recently viewed list for MOVIE and SERIES")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Combined recently viewed list returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<RecentlyViewedDTO> getRecentlyViewed(
            @RequestParam(name = "limit", required = false) Integer limit,
            @AuthenticationPrincipal User user
    ) {
        return ResponseEntity.ok(recentlyViewedService.getRecentlyViewed(user, limit));
    }
}
