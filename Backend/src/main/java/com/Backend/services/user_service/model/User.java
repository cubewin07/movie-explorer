package com.Backend.services.user_service.model;

import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.watchlist_service.model.Watchlist;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;
import java.util.Set;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Username cannot be null")
    private String username;

    @NotNull(message = "Email cannot be null")
    private String email;

    @Size(min = 8, message = "Password must be at least 8 characters long")
    private String password;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    @Builder.Default
    private Watchlist watchlist = new Watchlist();

    @OneToMany(mappedBy = "user1")
    private Set<Friend> requestsFrom;

    @OneToMany(mappedBy = "user2")
    private Set<Friend> requestsTo;

    @Enumerated(EnumType.STRING)
    private ROLE role;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        ROLE effectiveRole = (role != null) ? role : ROLE.ROLE_USER;
        return List.of(new SimpleGrantedAuthority(effectiveRole.name()));
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    public void setWatchlist(Watchlist watchlist) {
        this.watchlist = watchlist;
        if(watchlist.getUser() != this) {
            watchlist.setUser(this);
        }
    }
}
