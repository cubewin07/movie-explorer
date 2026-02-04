package com.Backend.services.friend_service.repository;

import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.friend_service.model.FriendIdEb;
import com.Backend.services.friend_service.model.Status;
import com.Backend.services.user_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRepo extends JpaRepository<Friend, FriendIdEb> {
    Optional<Friend> findByUser1AndUser2(User user1, User user2);

    @Query("""
            SELECT f FROM Friend f 
            WHERE (f.user1 = :user1 AND f.user2 = :user2) 
            OR (f.user1 = :user2 AND f.user2 = :user1)
            """)
    Optional<Friend> findFriendshipBetween(@Param("user1") User user1, @Param("user2") User user2);

    List<Friend> findByUser1AndStatus(User user1, Status status);
    List<Friend> findByUser2AndStatus(User user2, Status status);

    @Query("""
            SELECT f FROM Friend f 
            WHERE (f.user1 = :user AND f.status = :status) 
            OR (f.user2 = :user AND f.status = :status)
            """)
    List<Friend> findAllFriendshipsByUserAndStatus(@Param("user") User user, @Param("status") Status status);

    @Query("""
            SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END 
            FROM Friend f 
            WHERE (f.user1 = :user1 AND f.user2 = :user2) 
            OR (f.user1 = :user2 AND f.user2 = :user1)
            """)
    boolean existsFriendshipBetween(@Param("user1") User user1, @Param("user2") User user2);

    @Query("SELECT COUNT(f) FROM Friend f WHERE f.status = :status")
    long countByStatus(@Param("status") Status status);
}
