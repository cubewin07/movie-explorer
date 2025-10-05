package com.Backend.services.friend_service.service;


import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.friend_service.model.Status;
import com.Backend.services.friend_service.model.DTO.FriendDTO;
import com.Backend.services.friend_service.model.DTO.FriendRequestDTO;
import com.Backend.services.friend_service.model.DTO.FriendUserDTO;
import com.Backend.services.friend_service.repository.FriendRepo;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.exception.UserNotFoundException;
import com.Backend.exception.FriendshipNotFoundException;
import com.Backend.exception.FriendNotFoundException;
import com.Backend.exception.FriendRequestAlreadyExistsException;
import com.Backend.exception.NotAuthorizedToModifyFriendshipException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {
    private final FriendRepo friendRepo;
    private final UserRepository userRepository;

    public Set<FriendRequestDTO> getRequestsFromThisUser(Long id) {
        User user = userRepository.findWithRequestsFrom(id).orElseThrow(() -> new FriendNotFoundException("User not found"));
        return user.getRequestsFrom().stream()
                .map(f -> new FriendRequestDTO(f.getUser2().getId(), f.getUser2().getEmail(), f.getStatus(), f.getCreatedAt()))
                .collect(Collectors.toSet());
    }

    public Set<FriendRequestDTO> getRequestsToThisUser(Long id) {
        User user = userRepository.findWithRequestsToById(id).orElseThrow(() -> new FriendNotFoundException("User not found"));
        return user.getRequestsTo().stream()
                .map(f -> new FriendRequestDTO(f.getUser1().getId(), f.getUser1().getEmail(), f.getStatus(), f.getCreatedAt()))
                .collect(Collectors.toSet());
    }

    @Transactional
    public void sendRequest(User user1, String friendEmail) {
        User user2 = userRepository.findByEmail(friendEmail).orElseThrow(() -> new FriendNotFoundException("Friend user not found"));

        // Check if a request already exists in either direction
        Optional<Friend> existingRequest = friendRepo.findByUser1AndUser2(user1, user2);
        if (existingRequest.isPresent()) {
            throw new FriendRequestAlreadyExistsException("Friend request already exists");
        }

        existingRequest = friendRepo.findByUser1AndUser2(user2, user1);
        if (existingRequest.isPresent()) {
            throw new FriendRequestAlreadyExistsException("Friend request already exists in opposite direction");
        }

        Friend friendReq = Friend.builder()
                .user1(user1)
                .user2(user2)
                .status(Status.PENDING)
                .build();
        friendRepo.save(friendReq);
    }

    public Status getFriendStatus(User user1, String friendEmail) {
        User user2 = userRepository.findByEmail(friendEmail)
                .orElseThrow(() -> new UserNotFoundException("User with email " + friendEmail + " not found"));
        return friendRepo.findFriendshipBetween(user1, user2)
                .map(Friend::getStatus)
                .orElseThrow(() -> new FriendshipNotFoundException("No friend relationship found"));
    }

    @Transactional
    public void updateFriend(User user1, String senderEmail, Status status) {
        User user2 = userRepository.findByEmail(senderEmail).orElseThrow(() -> new FriendNotFoundException("Friend user not found"));

        // Check both directions
        Optional<Friend> friendReq = friendRepo.findByUser1AndUser2(user1, user2);
        if (friendReq.isEmpty()) {
            friendReq = friendRepo.findByUser1AndUser2(user2, user1);
        }

        Friend friend = friendReq.orElseThrow(() -> new FriendshipNotFoundException("No friend relationship found"));

        // Only recipient can accept/reject
        if (status != Status.PENDING && friend.getUser2().getId().equals(user1.getId())) {
            friend.setStatus(status);
            friendRepo.save(friend);
        } else {
            throw new NotAuthorizedToModifyFriendshipException("Only the request recipient can update the status");
        }
    }

    public Set<FriendDTO> getAllFriends(User user) {
        List<Friend> friends = friendRepo.findAllFriendshipsByUserAndStatus(user, Status.ACCEPTED);
        return friends.stream()
                .map(f -> {
                        if(f.getUser1().getId().equals(user.getId())) 
                            return new FriendDTO(
                                new FriendUserDTO(f.getUser2().getId(), f.getUser2().getEmail(), f.getUser2().getRealUsername()),
                                f.getStatus()
                            );
                        else
                            return new FriendDTO(
                                new FriendUserDTO(f.getUser1().getId(), f.getUser1().getEmail(), f.getUser1().getUsername()),
                                f.getStatus()
                            );
                    }
                )
                .collect(Collectors.toSet());
    }

    @Transactional
    public void deleteFriend(User user1, String friendEmail) {
        User user2 = userRepository.findByEmail(friendEmail).orElseThrow(() -> new FriendNotFoundException("Friend user not found"));

        // Check both directions
        Friend friend = friendRepo.findFriendshipBetween(user1, user2)
                .orElseThrow(() -> new FriendshipNotFoundException("No friend relationship found"));

        // Both users should be able to delete the relationship
        if (friend.getUser1().getId().equals(user1.getId()) ||
                friend.getUser2().getId().equals(user1.getId())) {
            friendRepo.delete(friend);
        } else {
            throw new NotAuthorizedToModifyFriendshipException("Not authorized to delete this relationship");
        }
    }

}
