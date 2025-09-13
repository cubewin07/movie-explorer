package com.Backend.user_service.controller;

import com.Backend.user_service.model.AuthenticateDTO;
import com.Backend.user_service.model.JwtToken;
import com.Backend.user_service.model.RegisterDTO;
import com.Backend.user_service.model.User;
import com.Backend.user_service.service.UserService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping()
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PostMapping()
    public ResponseEntity<JwtToken> registerUser(@RequestBody RegisterDTO register) {
        return ResponseEntity.ok(userService.registerUser(register));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<JwtToken> authenticateUser(@RequestBody AuthenticateDTO authenticate) {
        return ResponseEntity.ok(userService.authenticateUser(authenticate));
    }

    @DeleteMapping()
    public ResponseEntity<Map<String, String>> deleteUserById(@AuthenticationPrincipal User user) {
        userService.deleteUserById(user.getId());
       return ResponseEntity.ok(Map.of("message", "User with id " + user.getId() + " deleted successfully"));
    }
}
