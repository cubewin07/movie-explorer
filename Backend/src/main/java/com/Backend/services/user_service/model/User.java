package com.Backend.services.user_service.model;

import com.Backend.services.chat_service.model.Chat;
import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.notification_service.Notification;
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
    }
)
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @NotNull(message = "Username cannot be null")
    @JsonProperty("username")
    private String username;

    @NotNull(message = "Email cannot be null")
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    @JsonManagedReference(value = "user-watchlist")
    private Watchlist watchlist = new Watchlist();

    @OneToMany(mappedBy = "user")
    @JsonManagedReference(value = "user-notifications")
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "user1")
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<Friend> requestsFrom = new ArrayList<>();

    @OneToMany(mappedBy = "user2")
    @OrderBy("createdAt DESC")
    @Builder.Default
    private List<Friend> requestsTo = new ArrayList<>();

    @ManyToMany(mappedBy = "participants")
    @Builder.Default
    @JsonBackReference(value = "chat-participants")
    private Set<Chat> chats = new HashSet<>();

    @OneToMany(mappedBy = "sender")
    @OrderBy("createdAt DESC")
    @Builder.Default
    @JsonManagedReference(value = "user-sent-messages")
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
