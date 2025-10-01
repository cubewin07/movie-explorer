package com.Backend.services.chat_service.model;

import java.util.Set;
import java.util.HashSet;

import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.user_service.model.User;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.Data;
import lombok.Builder;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;

@Entity
@Data
@Builder
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
    @Builder.Default
    @JsonManagedReference
    private Set<User> participants = new HashSet<>();

    @OneToMany(mappedBy = "chat")
    @Builder.Default
    @JsonBackReference
    private Set<Message> messages = new HashSet<>();

    public void addParticipant(User user) {
        this.participants.add(user);
        user.getChats().add(this);
    }

    public void removeParticipant(User user) {
        this.participants.remove(user);
        user.getChats().remove(this);
    }

    public Message addMessage(Message message) {
        this.messages.add(message);
        message.setChat(this);
        return message;
    }

    public void removeMessage(Message message) {
        this.messages.remove(message);
    }
}
