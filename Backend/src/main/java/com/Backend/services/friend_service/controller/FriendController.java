package com.Backend.services.friend_service.controller;

import java.util.Set;

import com.Backend.exception.ErrorRes;
import com.Backend.services.friend_service.model.*;
import com.Backend.services.friend_service.model.DTO.FriendDTO;
import com.Backend.services.friend_service.model.DTO.FriendRequestDTO;
import com.Backend.services.friend_service.model.DTO.FriendUpdatingBody;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import lombok.RequiredArgsConstructor;
import com.Backend.services.friend_service.service.FriendService;
import com.Backend.services.user_service.model.User;
import org.springframework.web.bind.annotation.DeleteMapping;


@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
@Tag(name = "Friends", description = "Friendship management APIs")
public class FriendController {

    private final FriendService friendService;
    
    @GetMapping("/requestsFrom")
    @Operation(summary = "Get outgoing friend requests")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Outgoing requests returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Set<FriendRequestDTO>> getRequestsFromThisUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(friendService.getRequestsFromThisUser(user.getId()));
    }

    @GetMapping("/requestsTo")
    @Operation(summary = "Get incoming friend requests")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Incoming requests returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Set<FriendRequestDTO>> getRequestsToThisUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(friendService.getRequestsToThisUser(user.getId()));
    }

    @GetMapping("/friend")
    @Operation(summary = "Get all friends")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Friends returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Set<FriendDTO>> getAllFriends(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(friendService.getAllFriends(user));
    }

    @GetMapping("/status")
    @Operation(summary = "Get friendship status with another user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Friendship status returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Status> getFriendStatus( @RequestParam("email") String email, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(friendService.getFriendStatus(user, email));
    }

    @PostMapping("/request")
    @Operation(summary = "Send friend request")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Friend request sent successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "409", description = "Friend request already exists", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Status> sendRequest(@RequestBody EmailBody emailBody, @AuthenticationPrincipal User user) {
        friendService.sendRequest(user, emailBody.email());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update")
    @Operation(summary = "Update friend request status")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Friend request updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid update request", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "403", description = "Not authorized to modify friendship", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "Friendship not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Void> updateFriend(@RequestBody FriendUpdatingBody friendUpdatingBody, @AuthenticationPrincipal User user) {
        friendService.updateFriend(user, friendUpdatingBody.id(), friendUpdatingBody.status());
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/delete")
    @Operation(summary = "Delete friend")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Friend deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "403", description = "Not authorized to modify friendship", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "Friendship not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Void> deleteFriend(@RequestParam(name = "id") Long id, @AuthenticationPrincipal User user) {
        friendService.deleteFriend(user, id);
        return ResponseEntity.ok().build();
    }       
}
