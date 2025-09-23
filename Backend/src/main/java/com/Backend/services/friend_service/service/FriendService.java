package com.Backend.services.friend_service.service;


import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.friend_service.repository.FriendRepo;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class FriendService {
    private final FriendRepo friendRepo;
    private final UserRepository userRepository;

    public Set<Friend> getFriend(Long id) {
        User user = userRepository.findWithFriends(id).orElseThrow();
        return user.getFriends();
    }

}
