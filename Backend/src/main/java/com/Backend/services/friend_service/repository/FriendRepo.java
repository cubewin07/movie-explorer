package com.Backend.services.friend_service.repository;

import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.friend_service.model.FriendIdEb;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRepo extends JpaRepository<Friend, FriendIdEb> {
}
