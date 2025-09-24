package com.Backend.services.friend_service.controller;

import java.util.Set;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import lombok.RequiredArgsConstructor;
import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.friend_service.model.Status;
import com.Backend.services.friend_service.service.FriendService;
import com.Backend.services.user_service.model.User;

@RestController
@RequestMapping("/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;
    
    @GetMapping("/requestsFrom")
    public ResponseEntity<Set<Friend>> getRequestsFromThisUser(Long id) {
        return ResponseEntity.ok(friendService.getRequestsFromThisUser(id));
    }

    @GetMapping("/requestsTo")
    public ResponseEntity<Set<Friend>> getRequestsToThisUser(Long id) {
        return ResponseEntity.ok(friendService.getRequestsToThisUser(id));
    }

    @GetMapping("/status")
    public ResponseEntity<Status> getFriendStatus(String friendEmail, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(friendService.getFriendStatus(user, friendEmail));
    }
}
