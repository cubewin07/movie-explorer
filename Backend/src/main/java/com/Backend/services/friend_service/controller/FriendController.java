package com.Backend.services.friend_service.controller;

import java.util.Set;

import com.Backend.services.friend_service.model.*;
import com.Backend.services.friend_service.model.DTO.FriendDTO;
import com.Backend.services.friend_service.model.DTO.FriendRequestDTO;
import com.Backend.services.friend_service.model.DTO.FriendUpdatingBody;

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
public class FriendController {

    private final FriendService friendService;
    
    @GetMapping("/requestsFrom")
    public ResponseEntity<Set<FriendRequestDTO>> getRequestsFromThisUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(friendService.getRequestsFromThisUser(user.getId()));
    }

    @GetMapping("/requestsTo")
    public ResponseEntity<Set<FriendRequestDTO>> getRequestsToThisUser(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(friendService.getRequestsToThisUser(user.getId()));
    }

    @GetMapping("/friend")
    public ResponseEntity<Set<FriendDTO>> getAllFriends(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(friendService.getAllFriends(user));
    }

    @GetMapping("/status")
    public ResponseEntity<Status> getFriendStatus( @RequestParam("email") String email, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(friendService.getFriendStatus(user, email));
    }

    @PostMapping("/request")
    public ResponseEntity<Status> sendRequest(@RequestBody EmailBody emailBody, @AuthenticationPrincipal User user) {
        friendService.sendRequest(user, emailBody.email());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/update")
    public ResponseEntity<Void> updateFriend(@RequestBody FriendUpdatingBody friendUpdatingBody, @AuthenticationPrincipal User user) {
        friendService.updateFriend(user, friendUpdatingBody.email(), friendUpdatingBody.status());
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/delete")
    public ResponseEntity<Void> deleteFriend(@RequestBody EmailBody emailBody, @AuthenticationPrincipal User user) {
        friendService.deleteFriend(user, emailBody.email());
        return ResponseEntity.ok().build();
    }       
}
