package com.Backend.services.user_service.model;

import java.time.LocalDateTime;

import com.Backend.services.friend_service.model.Status;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendDTO {
    private SimpleUserDTO user;
    private Status status;
    private LocalDateTime createdAt;
}
