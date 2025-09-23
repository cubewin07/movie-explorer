package com.Backend.services.friend_service.repository;

import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.friend_service.model.FriendIdEb;
import com.Backend.services.user_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FriendRepo extends JpaRepository<Friend, FriendIdEb> {
    Optional<Friend> findByUser1AndUser2(User user1, User user2);
}
