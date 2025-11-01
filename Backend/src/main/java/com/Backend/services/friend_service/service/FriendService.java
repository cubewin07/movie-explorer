package com.Backend.services.friend_service.service;

import com.Backend.services.friend_service.model.Friend;
import com.Backend.services.friend_service.model.Status;
import com.Backend.services.friend_service.model.DTO.FriendDTO;
import com.Backend.services.friend_service.model.DTO.FriendRequestDTO;
import com.Backend.services.friend_service.model.DTO.FriendUserDTO;
import com.Backend.services.friend_service.repository.FriendRepo;
import com.Backend.services.notification_service.model.SimpleNotificationDTO;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.service.UserService;
import com.Backend.exception.FriendshipNotFoundException;
import com.Backend.exception.FriendRequestAlreadyExistsException;
import com.Backend.exception.NotAuthorizedToModifyFriendshipException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import com.Backend.websocket.eventListener.STOMPEventListener;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FriendService {
    private final FriendRepo friendRepo;
    private final UserService userService;
    private final CacheManager cacheManager;
    private final STOMPEventListener eventListener;
    private final ApplicationEventPublisher publisher;

    @Cacheable(value = "friendRequests", key = "'from-' + #id")
    public Set<FriendRequestDTO> getRequestsFromThisUser(Long id) {
        log.debug("Fetching requests from user id={} from database", id);
        User user = userService.getUserWithRequestsFrom(id);
        if (user.getRequestsFrom() == null || user.getRequestsFrom().isEmpty()) {
            return Set.of();
        }
        return user.getRequestsFrom().stream()
                .map(f -> new FriendRequestDTO(f.getUser2().getId(), f.getUser2().getEmail(), f.getUser2().getRealUsername(), f.getStatus(), f.getCreatedAt()))
                .collect(Collectors.toSet());
    }

    @Cacheable(value = "friendRequests", key = "'to-' + #id")
    public Set<FriendRequestDTO> getRequestsToThisUser(Long id) {
        log.debug("Fetching requests to user id={} from database", id);
        User user = userService.getUserWithRequestsTo(id);
        if (user.getRequestsTo() == null || user.getRequestsTo().isEmpty()) {
            return Set.of();
        }
        return user.getRequestsTo().stream()
                .map(f -> new FriendRequestDTO(f.getUser1().getId(), f.getUser1().getEmail(), f.getUser1().getRealUsername(),f.getStatus(), f.getCreatedAt()))
                .collect(Collectors.toSet());
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "friendRequests", key = "'from-' + #user1.id"),
            @CacheEvict(value = "friendRequests", key = "'to-' + #user1.id"),
            @CacheEvict(value = "friends", key = "#user1.id"),
            @CacheEvict(value = "friends", key = "#user1.email"),
            @CacheEvict(value = "friendStatus", allEntries = true),
            @CacheEvict(value = "userMeDTO", key = "#user1.email"),
            @CacheEvict(value = "isFriend", allEntries = true)
    })
    public void sendRequest(User user1, String friendEmail) {
        User user2 = userService.getUserByEmail(friendEmail);

        // Check if a request already exists in either direction
        Optional<Friend> existingRequest = friendRepo.findByUser1AndUser2(user1, user2);
        if (existingRequest.isPresent()) {
            throw new FriendRequestAlreadyExistsException("Friend request already exists");
        }

        existingRequest = friendRepo.findByUser1AndUser2(user2, user1);
        if (existingRequest.isPresent()) {
            throw new FriendRequestAlreadyExistsException("Friend request already exists in opposite direction");
        }

        SimpleNotificationDTO simpleNotificationDTO =   SimpleNotificationDTO.builder()
                        .user(user2)
                        .type("friendRequest")
                        .id(user1.getId())
                        .message(user1.getRealUsername() + " has sent you a friend request")
                        .build();
        publisher.publishEvent(simpleNotificationDTO);

        Friend friendReq = Friend.builder()
                .user1(user1)
                .user2(user2)
                .status(Status.PENDING)
                .build();
        friendRepo.save(friendReq);

        // Manually evict user2's caches since they received a request
        evictCacheForUser(user2, "to");

        log.debug("Friend request sent from user={} to user={}", user1.getId(), user2.getId());
    }

    @Cacheable(value = "friendStatus", key = "#user1.id + '-' + #friendEmail")
    public Status getFriendStatus(User user1, String friendEmail) {
        log.debug("Fetching friend status for user={} and friend={} from database", user1.getId(), friendEmail);
        User user2 = userService.getUserByEmail(friendEmail);
        return friendRepo.findFriendshipBetween(user1, user2)
                .map(Friend::getStatus)
                .orElseThrow(() -> new FriendshipNotFoundException("No friend relationship found"));
    }

    @Cacheable(value = "friendStatus", key = "#user1.id + '-' + #friendId")
    public Status getFriendStatus(User user1, Long friendId) {
        log.debug("Fetching friend status for user={} and friendId={} from database", user1.getId(), friendId);
        User user2 = userService.getUserById(friendId);
        return friendRepo.findFriendshipBetween(user1, user2)
                .map(Friend::getStatus)
                .orElseThrow(() -> new FriendshipNotFoundException("No friend relationship found"));
    }

    @Cacheable(value = "isFriend", key = "#user1.id + '-' + #friendEmail" )
    public boolean isFriend(User user1, String friendEmail) {
        log.info("Checking if user={} is a friend of user with email={}", user1.getId(), friendEmail);
        User user2 = userService.getUserByEmail(friendEmail);
        return friendRepo.existsFriendshipBetween(user1, user2);
    }

    @Cacheable(value = "isFriend", key = "#user1.id + '-' + #friendId" )
    public boolean isFriend(User user1, Long friendId) {
        log.info("Checking if user={} is a friend of user with id={}", user1.getId(), friendId);
        User user2 = userService.getUserById(friendId);
        return friendRepo.existsFriendshipBetween(user1, user2);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "friendRequests", key = "'from-' + #user1.id"),
            @CacheEvict(value = "friendRequests", key = "'to-' + #user1.id"),
            @CacheEvict(value = "friends", key = "#user1.id"),
            @CacheEvict(value = "friends", key = "#user1.email"),
            @CacheEvict(value = "friendStatus", allEntries = true),
            @CacheEvict(value = "isFriend", allEntries = true),
            @CacheEvict(value = "userMeDTO", key = "#user1.email")
    })
    public void updateFriend(User user1, Long senderEmail, Status status) {
        User user2 = userService.getUserById(senderEmail);

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

            // Manually evict user2's caches
            evictAllCachesForUser(user2);

            log.debug("Friend request updated: user={} to status={}", user1.getId(), status);
        } else {
            throw new NotAuthorizedToModifyFriendshipException("Only the request recipient can update the status");
        }
    }

    @Cacheable(value = "friends", key = "#user.id")
    public Set<FriendDTO> getAllFriends(User user) {
        log.debug("Fetching all friends for user id={} from database", user.getId());
        List<Friend> friends = friendRepo.findAllFriendshipsByUserAndStatus(user, Status.ACCEPTED);
        return friends.stream()
                .map(f -> {
                    if (f.getUser1().getId().equals(user.getId())) {
                        Boolean isOnline = eventListener.isUserOnline(f.getUser2().getEmail());
                        log.info("isOnline: {}", isOnline);
                        return new FriendDTO(
                                new FriendUserDTO(
                                        f.getUser2().getId(),
                                        f.getUser2().getEmail(),
                                        f.getUser2().getRealUsername()
                                ),
                                isOnline
                        );
                    } else {
                        Boolean isOnline = eventListener.isUserOnline(f.getUser1().getEmail());
                        log.info("isOnline: {}", isOnline);
                        return new FriendDTO(
                                new FriendUserDTO(
                                        f.getUser1().getId(),
                                        f.getUser1().getEmail(),
                                        f.getUser1().getRealUsername()
                                ),
                                isOnline
                        );
                    }
                })

                .collect(Collectors.toSet());
    }

    @Cacheable(value = "friends", key = "#email")
    public Set<Long> getAllFriendsReturnASetOfIds(String email) {
        User user = userService.getUserByEmail(email);
        List<Friend> friends = friendRepo.findAllFriendshipsByUserAndStatus(user, Status.ACCEPTED);
        return friends.stream()
                .map(f -> {
                    if(f.getUser1().getId().equals(user.getId())) {
                        return f.getUser2().getId();
                    } else {
                        return f.getUser1().getId();
                    }
                }).collect(Collectors.toSet());

    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "friendRequests", key = "'from-' + #user1.id"),
            @CacheEvict(value = "friendRequests", key = "'to-' + #user1.id"),
            @CacheEvict(value = "friends", key = "#user1.id"),
            @CacheEvict(value = "friends", key = "#user1.email"),
            @CacheEvict(value = "friendStatus", allEntries = true),
            @CacheEvict(value = "isFriend", allEntries = true),
            @CacheEvict(value = "userMeDTO", key = "#user1.email")
    })
    public void deleteFriend(User user1, Long friendEmail) {
        User user2 = userService.getUserById(friendEmail);

        // Check both directions
        Friend friend = friendRepo.findFriendshipBetween(user1, user2)
                .orElseThrow(() -> new FriendshipNotFoundException("No friend relationship found"));

        // Both users should be able to delete the relationship
        if (friend.getUser1().getId().equals(user1.getId()) ||
                friend.getUser2().getId().equals(user1.getId())) {
            friendRepo.delete(friend);

            // Manually evict user2's caches
            evictAllCachesForUser(user2);

            log.info("Friend relationship deleted between user={} and friend={}", user1.getId(), user2.getId());
        } else {
            throw new NotAuthorizedToModifyFriendshipException("Not authorized to delete this relationship");
        }
    }

    // Helper methods for manual cache eviction
    private void evictCacheForUser(User user, String requestType) {
        Cache friendRequestsCache = cacheManager.getCache("friendRequests");
        if (friendRequestsCache != null) {
            friendRequestsCache.evict(requestType + "-" + user.getId());
        }

        Cache userMeDTOCache = cacheManager.getCache("userMeDTO");
        if (userMeDTOCache != null) {
            userMeDTOCache.evict(user.getEmail());
        }
    }

    private void evictAllCachesForUser(User user) {
        Cache friendRequestsCache = cacheManager.getCache("friendRequests");
        if (friendRequestsCache != null) {
            friendRequestsCache.evict("from-" + user.getId());
            friendRequestsCache.evict("to-" + user.getId());
        }

        Cache friendsCache = cacheManager.getCache("friends");
        if (friendsCache != null) {
            friendsCache.evict(user.getId());
            friendsCache.evict(user.getEmail());
        }

        Cache userMeDTOCache = cacheManager.getCache("userMeDTO");
        if (userMeDTOCache != null) {
            userMeDTOCache.evict(user.getEmail());
        }
    }
}