package com.Backend.services.user_service.controller;

import com.Backend.services.user_service.model.*;
import com.Backend.services.user_service.model.DTO.AuthenticateDTO;
import com.Backend.services.user_service.model.DTO.RegisterDTO;
import com.Backend.services.user_service.model.DTO.UpdateUserDTO;
import com.Backend.services.user_service.model.DTO.UserMeDTO;
import com.Backend.services.user_service.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    @PostMapping("/register")
    public ResponseEntity<JwtToken> registerUser(@RequestBody RegisterDTO register) {
        return ResponseEntity.ok(userService.registerUser(register));
    }

    @PostMapping("/authenticate")
    public ResponseEntity<JwtToken> authenticateUser(@RequestBody AuthenticateDTO authenticate) {
        return ResponseEntity.ok(userService.authenticateUser(authenticate));
    }

    @GetMapping("/me")
    public ResponseEntity<UserMeDTO> getUserById(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getMeDTO(user));
    }

    @PutMapping()
    public ResponseEntity<User> updateUser(@RequestBody UpdateUserDTO update, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.updateUser(update, user));
    }

    @DeleteMapping()
    public ResponseEntity<Map<String, String>> deleteUserById(@AuthenticationPrincipal User user) {
        userService.deleteUserById(user.getId());
       return ResponseEntity.ok(Map.of("message", "User with id " + user.getId() + " deleted successfully"));
    }
}
