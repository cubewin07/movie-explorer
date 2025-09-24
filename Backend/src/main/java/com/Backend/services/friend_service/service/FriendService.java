package com.Backend.services.friend_service.service;


import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.friend_service.model.Status;
import com.Backend.services.friend_service.repository.FriendRepo;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;
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

        // Check if a request already exists in either direction
        Optional<Friend> existingRequest = friendRepo.findByUser1AndUser2(user1, user2);
        if (existingRequest.isPresent()) {
            throw new IllegalStateException("Friend request already exists");
        }

        existingRequest = friendRepo.findByUser1AndUser2(user2, user1);
        if (existingRequest.isPresent()) {
            throw new IllegalStateException("Friend request already exists in opposite direction");
        }

        Friend friendReq = Friend.builder()
                .user1(user1)
                .user2(user2)
                .status(Status.PENDING)
                .build();
        friendRepo.save(friendReq);
    }

    public Status getFriendStatus(User user1, String friendEmail) {
        User user2 = userRepository.findByEmail(friendEmail).orElseThrow();
        return friendRepo.findFriendshipBetween(user1, user2)
                .map(Friend::getStatus)
                .orElseThrow(() -> new IllegalStateException("No friend relationship found"));
    }

    @Transactional
    public void updateFriend(User user1, String friendEmail, Status status) {
        User user2 = userRepository.findByEmail(friendEmail).orElseThrow();

        // Check both directions
        Optional<Friend> friendReq = friendRepo.findByUser1AndUser2(user1, user2);
        if (friendReq.isEmpty()) {
            friendReq = friendRepo.findByUser1AndUser2(user2, user1);
        }

        Friend friend = friendReq.orElseThrow(() -> new IllegalStateException("No friend relationship found"));

        // Only recipient can accept/reject
        if (status != Status.PENDING && friend.getUser2().getId().equals(user1.getId())) {
            friend.setStatus(status);
            friendRepo.save(friend);
        } else {
            throw new IllegalStateException("Only the request recipient can update the status");
        }
    }

    @Transactional
    public void deleteFriend(User user1, String friendEmail) {
        User user2 = userRepository.findByEmail(friendEmail).orElseThrow();

        // Check both directions
        Optional<Friend> friendReq = friendRepo.findByUser1AndUser2(user1, user2);
        if (friendReq.isEmpty()) {
            friendReq = friendRepo.findByUser1AndUser2(user2, user1);
        }

        Friend friend = friendReq.orElseThrow(() -> new IllegalStateException("No friend relationship found"));

        // Both users should be able to delete the relationship
        if (friend.getUser1().getId().equals(user1.getId()) ||
                friend.getUser2().getId().equals(user1.getId())) {
            friendRepo.delete(friend);
        } else {
            throw new IllegalStateException("Not authorized to delete this relationship");
        }
    }

}
