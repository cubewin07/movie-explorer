package com.Backend.services.watchlist_service.controller;

import com.Backend.exception.ErrorRes;
import com.Backend.services.user_service.model.User;
import com.Backend.services.watchlist_service.model.WatchlistPosting;
import com.Backend.services.watchlist_service.model.WatchlistDTO;
import com.Backend.services.FilmType;
import com.Backend.services.watchlist_service.service.WatchlistService;
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

@RestController
@RequestMapping("/watchlist")
@RequiredArgsConstructor
@Tag(name = "Watchlist", description = "Watchlist management APIs")
public class WatchlistController {
    private final WatchlistService watchlistService;

    @GetMapping()
    @Operation(summary = "Get current user watchlist")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Watchlist returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "Watchlist not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<WatchlistDTO> getWatchlist(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(watchlistService.getWatchlist(user));
    }

    @PostMapping
    @Operation(summary = "Add film to watchlist")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item added to watchlist successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid posting type or payload", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "409", description = "Duplicate watchlist item", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Void> addToWatchlist(@RequestBody WatchlistPosting posting, @AuthenticationPrincipal User user) {
        if(posting.type().equals(FilmType.MOVIE) || posting.type().equals(FilmType.SERIES))
            watchlistService.addToWatchlist(posting, user);
        else
            throw new IllegalArgumentException("Invalid posting type");
        return ResponseEntity.ok().build();
    }
    @DeleteMapping()
    @Operation(summary = "Remove film from watchlist")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Item removed from watchlist successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid posting type or payload", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "Watchlist item not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Void> deleteFromWatchlist(@RequestParam(name = "id") Long id, @RequestParam(name = "type") FilmType type, @AuthenticationPrincipal User user) {
        WatchlistPosting posting = new WatchlistPosting(type, id);
        if(type.equals(FilmType.MOVIE) || type.equals(FilmType.SERIES))
            watchlistService.removeFromWatchlist(posting, user);
        else
            throw new IllegalArgumentException("Invalid posting type");
        return ResponseEntity.ok().build();
    }
}
