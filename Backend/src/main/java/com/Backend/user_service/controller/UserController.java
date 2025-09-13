package com.Backend.user_service.controller;

import com.Backend.user_service.model.JwtToken;
import com.Backend.user_service.model.RegisterDTO;
import com.Backend.user_service.model.User;
import com.Backend.user_service.service.UserService;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

}
