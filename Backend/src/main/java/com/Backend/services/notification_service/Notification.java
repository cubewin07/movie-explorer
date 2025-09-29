package com.Backend.services.notification_service;

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
import org.hibernate.annotations.ColumnDefault;

@Entity
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
public class Notification {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonBackReference
    private User user;

    @Column(name = "type")
    private String type;

    @Column(name = "related_id")
    private Long relatedId;

    private String message;

    @Column(name = "is_read")
    @ColumnDefault("false")
    private boolean isRead;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
