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

    @Query("Select User u left join fetch u.friends f where f.user1 = u.id ")
     Optional<User> findByIdwithFriendlist(Long id);

    Optional<User> findByUsername(String username);
}
