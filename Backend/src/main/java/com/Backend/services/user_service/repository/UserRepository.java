package com.Backend.services.user_service.repository;

import com.Backend.services.user_service.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;
import java.util.Set;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = {"watchlist", "watchlist.seriesId", "watchlist.moviesId", "notifications", "chats", "chats.participants"})
    Optional<User> findByEmail(String email);

    @Query("""
        Select distinct u 
        from User u
        left join fetch u.requestsFrom f 
        left join fetch u.requestsTo r
        left join fetch u.watchlist 
        left join fetch u.notifications
        where u.id = :id
    """)
     Optional<User> findByIdFull(Long id);

    @Query("""
        Select distinct u 
        from User u
        left join fetch u.requestsFrom f 
        where u.id = :id
    """)
    Optional<User> findWithRequestsFrom(Long id);

    @Query("""
        Select distinct u
        from User u
        left join fetch u.requestsTo r
        where u.id = :id
        """)
    Optional<User> findWithRequestsToById(Long id);

    Optional<User> findByUsername(String username);

    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
}
