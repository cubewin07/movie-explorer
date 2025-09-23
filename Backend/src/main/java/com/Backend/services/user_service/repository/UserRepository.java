package com.Backend.services.user_service.repository;

import com.Backend.services.user_service.model.User;
import org.springframework.data.domain.Example;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    @EntityGraph(attributePaths = "watchlist")
    Optional<User> findByEmail(String email);

    @Query("""
        Select distinct u 
        from User u
        left join fetch u.friends f 
        left join fetch u.requests r
        left join fetch u.watchlist 
        where u.id = :id
    """)
     Optional<User> findByIdFull(Long id);

   @EntityGraph(attributePaths = "friends")
    Optional<User> findWithFriends(Long id);

    @EntityGraph(attributePaths = "requests")
    Optional<User> findWithRequests(Long id);

    Optional<User> findByUsername(String username);
}
