package com.Backend.services.friend_service.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.Backend.services.user_service.model.User;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.EnumType;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder    
@Data
@IdClass(FriendIdEb.class)
@Table(
    name = "friends",
    indexes = {
        @Index(name = "idx_friend_user_status", columnList = "user1_id, status"),
        @Index(name = "idx_friend_friend_status", columnList = "user2_id, status"),
        @Index(name = "idx_friend_user_created_at", columnList = "user1_id, created_at DESC"),
    }
)
public class Friend {

    @Id
    @ManyToOne()
    @JoinColumn(name = "user1_id", nullable = false)
    @NotNull(message = "User1 cannot be null")
    private User user1;

    @Id
    @ManyToOne()
    @JoinColumn(name = "user2_id", nullable = false)
    @NotNull(message = "User2 cannot be null")
    private User user2;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    @NotNull(message = "Status cannot be null")
    private Status status = Status.PENDING;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
