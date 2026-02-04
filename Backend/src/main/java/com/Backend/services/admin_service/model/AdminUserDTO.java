package com.Backend.services.admin_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminUserDTO {
    private Long id;
    private String email;
    private String username;
    private String role;
}
