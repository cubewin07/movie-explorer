package com.Backend.services.chat_service.message.model;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.Backend.services.chat_service.model.Chat;
import com.Backend.services.user_service.model.User;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Index;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data   
@Builder
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(
    name = "messages",
    indexes = {
        @Index(name = "idx_chat_id", columnList = "chat_id, created_at DESC"),
    }
)
public class Message {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @JoinColumn(name = "chat_id")
    @ManyToOne
    @JsonBackReference(value = "chat-messages")
    private Chat chat;

    @JoinColumn(name = "sender_id")
    @ManyToOne
    @JsonBackReference(value = "user-sent-messages")
    private User sender;

    private String content;

    @Builder.Default
    @ColumnDefault("'false'")
    private boolean isRead = false;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
