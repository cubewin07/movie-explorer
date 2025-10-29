package com.Backend.services.user_service.model;

import com.Backend.services.chat_service.model.Chat;
import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.notification_service.model.Notification;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonProperty;

import org.hibernate.annotations.BatchSize;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Email;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@JsonIgnoreProperties({
        "accountNonExpired",
        "accountNonLocked",
        "credentialsNonExpired",
        "enabled"
})

@Entity
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_user_email", columnList = "email"),
        @Index(name = "idx_user_id", columnList = "id"),
    },
    uniqueConstraints = {
        @UniqueConstraint(name = "unique_email", columnNames = "email"),
    }
)
@BatchSize(size = 20)
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false, length = 50)
    @NotNull(message = "Username cannot be null")
    @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
    @JsonProperty("username")
    private String username;

    @Column(nullable = false, length = 100)
    @NotNull(message = "Email cannot be null")
    @Email(message = "Email should be valid")
    private String email;

    @Column(nullable = false)
    @Size(min = 8, message = "Password must be at least 8 characters long")
    @NotNull(message = "Password cannot be null")
    @JsonIgnore
    private String password;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "user-watchlist")
    @OrderBy("created_at DESC")
    @Builder.Default
    private Watchlist watchlist = new Watchlist();

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @JsonManagedReference(value = "user-notifications")
    @OrderBy("createdAt DESC")
    @Builder.Default
    @NotNull(message = "Notifications list cannot be null")
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "user1", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    @Builder.Default
    @NotNull(message = "Friend requests from user cannot be null")
    private List<Friend> requestsFrom = new ArrayList<>();

    @OneToMany(mappedBy = "user2", cascade = CascadeType.REMOVE, orphanRemoval = true)
    @OrderBy("createdAt DESC")
    @Builder.Default
    @NotNull(message = "Friend requests to user cannot be null")
    private List<Friend> requestsTo = new ArrayList<>();

    @ManyToMany(mappedBy = "participants")
    @Builder.Default
    @JsonBackReference(value = "chat-participants")
    @NotNull(message = "Chats set cannot be null")
    private Set<Chat> chats = new HashSet<>();

    @OneToMany(mappedBy = "sender")
    @Builder.Default
    @JsonManagedReference(value = "user-sent-messages")
    @NotNull(message = "Sent messages list cannot be null")
    private Set<Message> sentMessages = new HashSet<>();

    @Enumerated(EnumType.STRING)
    private ROLE role;

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        ROLE effectiveRole = (role != null) ? role : ROLE.ROLE_USER;
        return List.of(new SimpleGrantedAuthority(effectiveRole.name()));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @JsonIgnore
    @Override
    public String getUsername() {
        return this.email;
    }

    @JsonIgnore
    public String getRealUsername() {
        return this.username;
    }

    public void setWatchlist(Watchlist watchlist) {
        this.watchlist = watchlist;
        if(watchlist.getUser() != this) {
            watchlist.setUser(this);
        }
    }
}
