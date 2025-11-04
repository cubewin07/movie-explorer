package com.Backend.services.user_service.controller;

import com.Backend.services.user_service.model.DTO.*;
import jakarta.validation.Valid;
import com.Backend.services.user_service.model.*;
import com.Backend.services.user_service.service.UserService;

import lombok.RequiredArgsConstructor;
import net.bytebuddy.build.Plugin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/all")
    public ResponseEntity<List<SimpleUserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsersDTO());
    }

    @PostMapping("/register")
    public ResponseEntity<JwtToken> registerUser(@Valid @RequestBody RegisterDTO register) {
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

    @GetMapping("/search")
    public ResponseEntity<Page<SimpleUserDTO>> searchUsers(
            @RequestParam(name = "query") String query,
            @RequestParam(name = "page") int page,
            @AuthenticationPrincipal User user) {

        Long id = user.getId();
        int size = 20;

        List<SimpleUserDTO> results = userService.searchUsers(query, id, page, size);

        Page<SimpleUserDTO> pageResult = new PageImpl<>(results, PageRequest.of(page, size), results.size());
        return ResponseEntity.ok(pageResult);
    }

    @GetMapping("/{id}")
    public ResponseEntity<GetInfoDTO> getUserById(@PathVariable("id") Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getInfoDTO(user, id));
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
