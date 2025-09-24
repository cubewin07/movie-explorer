package com.Backend.services.friend_service.service;


import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.friend_service.model.Status;
import com.Backend.services.friend_service.repository.FriendRepo;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class FriendService {
    private final FriendRepo friendRepo;
    private final UserRepository userRepository;

    public Set<Friend> getRequestsFromThisUser(Long id) {
        User user = userRepository.findWithRequestsFrom(id).orElseThrow();
        return user.getRequestsFrom();
    }

    public Set<Friend> getRequestsToThisUser(Long id) {
        User user = userRepository.findWithRequestsToById(id).orElseThrow();
        return user.getRequestsTo();
    }

    @Transactional
    public void sendRequest(User user1, String friendEmail) {
        User user2 = userRepository.findByEmail(friendEmail).orElseThrow();
        Friend friendReq = Friend.builder().user1(user1).user2(user2).build();
        friendRepo.save(friendReq);
    }

    public Status getFriendStatus(User user1, String friendEmail) {
        User user2 = userRepository.findByEmail(friendEmail).orElseThrow();
        Friend friendReq = friendRepo.findByUser1AndUser2(user1, user2).orElseThrow();
        return friendReq.getStatus();
    }

    @Transactional
    public void updateFriend(User user1, String accepterEmail, Status status) {
        User user2 = userRepository.findByEmail(accepterEmail).orElseThrow();
        Friend friendReq = friendRepo.findByUser1AndUser2(user1, user2).orElseThrow();
        friendReq.setStatus(status);
        friendRepo.save(friendReq);
    }

//    Need refinement
    @Transactional
    public void deleteFriend(User user1, String friendEmail) {
        User user2 = userRepository.findByEmail(friendEmail).orElseThrow();
        Friend friendReq = friendRepo.findByUser1AndUser2(user1, user2).orElseThrow();
        friendRepo.delete(friendReq);
    }

}
