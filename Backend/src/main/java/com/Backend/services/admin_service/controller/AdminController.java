package com.Backend.services.admin_service.controller;

import com.Backend.exception.ErrorRes;
import com.Backend.services.admin_service.model.AdminRoleUpdateRequest;
import com.Backend.services.admin_service.model.AdminStatsDTO;
import com.Backend.services.admin_service.model.AdminUserDTO;
import com.Backend.services.admin_service.service.AdminService;
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
import com.Backend.services.user_service.model.User;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin management APIs")
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/users")
    @Operation(summary = "List users for admin")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Users returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
        })
    public ResponseEntity<Page<AdminUserDTO>> listUsers(
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size,
            @AuthenticationPrincipal User admin
    ) {
        Page<AdminUserDTO> users = adminService.listUsers(query, PageRequest.of(page, size));
        return ResponseEntity.ok(new PageImpl<>(users.getContent(), users.getPageable(), users.getTotalElements()));
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Get user details for admin")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "User returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
        })
    public ResponseEntity<AdminUserDTO> getUser(@PathVariable("id") Long id, @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(adminService.getUser(id));
    }

    @PatchMapping("/users/{id}/role")
    @Operation(summary = "Update user role")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Role updated successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid role request", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
        })
    public ResponseEntity<AdminUserDTO> updateUserRole(
            @PathVariable("id") Long id,
            @RequestBody AdminRoleUpdateRequest request,
            @AuthenticationPrincipal User admin
    ) {
        AdminUserDTO dto = adminService.updateRole(id, request.role());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/stats/summary")
    @Operation(summary = "Get admin stats summary")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Summary returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "403", description = "Forbidden", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<AdminStatsDTO> getStatsSummary(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(adminService.getSummary());
    }
}
