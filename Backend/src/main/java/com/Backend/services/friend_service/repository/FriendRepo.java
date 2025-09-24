package com.Backend.services.friend_service.repository;

import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.friend_service.model.FriendIdEb;
import com.Backend.services.friend_service.model.Status;
import com.Backend.services.user_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FriendRepo extends JpaRepository<Friend, FriendIdEb> {
    Optional<Friend> findByUser1AndUser2(User user1, User user2);

    List<Friend> findByUser1AndStatus(User user1, Status status);
    List<Friend> findByUser2AndStatus(User user2, Status status);

    boolean existsByUser1AndUser2(User user1, User user2);
    boolean existsByUser2AndUser1(User user2, User user1);
}
