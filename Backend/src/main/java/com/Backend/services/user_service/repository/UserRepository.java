package com.Backend.services.user_service.repository;

import com.Backend.services.user_service.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

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
            AND f.status <> Status.ACCEPTED
    """)
    Optional<User> findWithRequestsFrom(Long id);

    @Query("""
        Select distinct u
        from User u
        left join fetch u.requestsTo r
        where u.id = :id
            AND r.status <> Status.ACCEPTED
        """)
    Optional<User> findWithRequestsToById(Long id);

    Optional<User> findByUsername(String username);

    Page<User> findByUsernameContainingIgnoreCaseAndIdNot(String username, Long id, Pageable pageable);
}
