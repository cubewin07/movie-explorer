package com.Backend.services.chat_service.message;

import java.time.LocalDateTime;

import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import com.Backend.services.chat_service.Chat;
import com.Backend.services.user_service.model.User;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Builder;
import lombok.Data;

@Entity
@Data   
@Builder
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JoinColumn(name = "chat_id")
    @ManyToOne
    @JsonBackReference
    private Chat chat;

    @JoinColumn(name = "sender_id")
    @ManyToOne
    private User sender;

    private String content;

    @ColumnDefault("false")
    private boolean isRead;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
