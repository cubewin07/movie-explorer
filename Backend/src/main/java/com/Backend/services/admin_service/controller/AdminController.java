package com.Backend.services.admin_service.controller;

import com.Backend.services.admin_service.model.AdminRoleUpdateRequest;
import com.Backend.services.admin_service.model.AdminStatsDTO;
import com.Backend.services.admin_service.model.AdminUserDTO;
import com.Backend.services.admin_service.service.AdminService;
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
public class AdminController {
    private final AdminService adminService;

    @GetMapping("/users")
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
    public ResponseEntity<AdminUserDTO> getUser(@PathVariable("id") Long id, @AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(adminService.getUser(id));
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<AdminUserDTO> updateUserRole(
            @PathVariable("id") Long id,
            @RequestBody AdminRoleUpdateRequest request,
            @AuthenticationPrincipal User admin
    ) {
        AdminUserDTO dto = adminService.updateRole(id, request.role());
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/stats/summary")
    public ResponseEntity<AdminStatsDTO> getStatsSummary(@AuthenticationPrincipal User admin) {
        return ResponseEntity.ok(adminService.getSummary());
    }
}
