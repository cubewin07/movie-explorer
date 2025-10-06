package com.Backend.services.chat_service.model;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.user_service.model.User;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import lombok.*;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import jakarta.persistence.Index;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(
    name = "chats",
    indexes = {
        @Index(name = "idx_chat_id", columnList = "id"),
    }
)
public class Chat {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToMany()
    @JoinTable(
        name = "chat_participants",
        joinColumns = @JoinColumn(name = "chat_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    @Builder.Default
    @JsonManagedReference(value = "chat-participants")
    private Set<User> participants = new HashSet<>();

    @OneToMany(mappedBy = "chat")
    @OrderBy("createdAt DESC")
    @Builder.Default
    // @JsonIgnore
    @JsonManagedReference(value = "chat-messages")
    private List<Message> messages = new ArrayList<>();

    public void addParticipant(User user) {
        this.participants.add(user);
        user.getChats().add(this);
    }

    public void removeParticipant(User user) {
        this.participants.remove(user);
        user.getChats().remove(this);
    }

    public Message addMessage(Message message) {
        this.messages.add(0, message);
        message.setChat(this);
        return message;
    }

    public void removeMessage(Message message) {
        this.messages.remove(message);
    }
}
