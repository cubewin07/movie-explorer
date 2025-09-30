package com.Backend.services.chat_service;

import java.util.Set;

import com.Backend.services.user_service.model.User;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;

@Entity
public class Chat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToMany()
    @JoinTable(
        name = "chat_participants",
        joinColumns = @JoinColumn(name = "chat_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    Set<User> users;

    @OneToMany(mappedBy = "chat")
    Set<Message> messages;
}
