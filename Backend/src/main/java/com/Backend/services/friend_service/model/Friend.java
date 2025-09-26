package com.Backend.services.friend_service.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.Backend.services.user_service.model.User;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.EnumType;
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
public class Friend {

    @Id
    @ManyToOne
    @JoinColumn(name = "user1_id")
    private User user1;

    @Id
    @ManyToOne
    @JoinColumn(name = "user2_id")
    private User user2;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private Status status = Status.PENDING;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
