package com.Backend.services.notification_service.model;

import java.time.LocalDateTime;

import com.Backend.services.user_service.model.User;
import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import jakarta.validation.constraints.NotNull;

@Entity
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notification_user_id", columnList = "user_id, created_at DESC"),
    }
)
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    @NotNull(message = "User cannot be null")
    @JsonBackReference(value = "user-notifications")
    private User user;

    @Column(name = "type", nullable = false)
    @NotNull(message = "Notification type cannot be null")
    private String type;

    @Column(name = "related_id", nullable = false)
    @NotNull(message = "Related ID cannot be null")
    private Long relatedId;

    @Column(nullable = false)
    @NotNull(message = "Message content cannot be null")
    private String message;

    @Column(nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
