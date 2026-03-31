package com.Backend.services.user_service.controller;

import com.Backend.exception.ErrorRes;
import com.Backend.exception.ErrorResObject;
import com.Backend.services.user_service.model.DTO.*;
import jakarta.validation.Valid;
import com.Backend.services.user_service.model.*;
import com.Backend.services.user_service.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import lombok.RequiredArgsConstructor;
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
@Tag(name = "Users", description = "User registration, authentication, and profile APIs")
public class UserController {
    private final UserService userService;

    @GetMapping("/all")
    @Operation(summary = "Get all users")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Users returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<List<SimpleUserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsersDTO());
    }

    @PostMapping("/register")
    @Operation(summary = "Register a new user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User registered successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ErrorResObject.class))),
            @ApiResponse(responseCode = "409", description = "User already exists", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<JwtToken> registerUser(@Valid @RequestBody RegisterDTO register) {
        return ResponseEntity.ok(userService.registerUser(register));
    }

    @PostMapping("/authenticate")
    @Operation(summary = "Authenticate user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Authentication successful"),
            @ApiResponse(responseCode = "400", description = "Invalid request", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Authentication failed", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<JwtToken> authenticateUser(@RequestBody AuthenticateDTO authenticate) {
        return ResponseEntity.ok(userService.authenticateUser(authenticate));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current user profile")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Profile returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<UserMeDTO> getUserById(@AuthenticationPrincipal User user) {
        UserMeDTO dto = userService.getMeDTO(user);
        return ResponseEntity.ok()
                .header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
                .header("Pragma", "no-cache")
                .body(dto);
    }

    @GetMapping("/search")
    @Operation(summary = "Search users")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Users returned successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request parameters", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
        })
    public ResponseEntity<Page<SimpleUserDTO>> searchUsers(
            @RequestParam(name = "query") String query,
            @RequestParam(name = "page") int page,
            @AuthenticationPrincipal User user) {

        Long id = user.getId();
        int size = 20;

        List<SimpleUserDTO> results = userService.searchUsers(query, id, PageRequest.of(page, size));

        Long totalElements = (long) results.size();

        return ResponseEntity.ok(new PageImpl<>(results, PageRequest.of(page, size), totalElements));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get user profile by id")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User profile returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<GetInfoDTO> getUserById(@PathVariable("id") Long id, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getInfoDTO(user, id));
    }

    @PutMapping()
    @Operation(summary = "Update current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User updated successfully"),
            @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<User> updateUser(@RequestBody UpdateUserDTO update, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.updateUser(update, user));
    }

    @DeleteMapping()
    @Operation(summary = "Delete current user")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User deleted successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Map<String, String>> deleteUserById(@AuthenticationPrincipal User user) {
        userService.deleteUserById(user.getId());
       return ResponseEntity.ok(Map.of("message", "User with id " + user.getId() + " deleted successfully"));
    }
}
