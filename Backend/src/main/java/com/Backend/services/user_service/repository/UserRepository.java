package com.Backend.services.user_service.repository;

import com.Backend.services.user_service.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    @EntityGraph(attributePaths = {
            "watchlist", "watchlist.items", "watchlist.items.film",
            "notifications",
            "chats", "chats.participants"
    })
    @Query("""
        select u
        from User u
        where u.email = :email
    """)
    Optional<User> findByEmailWithProfileGraph(String email);

    @EntityGraph(attributePaths = {"watchlist", "watchlist.items", "watchlist.items.film"})
    @Query("""
        select u
        from User u
        where u.id = :id
    """)
    Optional<User> findByIdWithWatchlistGraph(Long id);

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
        left join fetch f.user2
        where u.id = :id 
            and (f is null or f.status <> Status.ACCEPTED)
    """)
    Optional<User> findWithRequestsFrom(Long id);

    @Query("""
        Select distinct u
        from User u
        left join fetch u.requestsTo r
        left join fetch r.user1
        where u.id = :id
            and (r is null or r.status <> Status.ACCEPTED)
        """)
    Optional<User> findWithRequestsToById(Long id);

    Optional<User> findByUsername(String username);

    Page<User> findByUsernameContainingIgnoreCaseAndIdNot(String username, Long id, Pageable pageable);
    List<User> findByUsernameContainingIgnoreCaseAndIdNot(String username, Long id);

    Page<User> findByUsernameContainingIgnoreCase(String username, Pageable pageable);
    long countByRole(com.Backend.services.user_service.model.ROLE role);
}
