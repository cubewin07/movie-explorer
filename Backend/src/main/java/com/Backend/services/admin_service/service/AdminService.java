package com.Backend.services.admin_service.service;

import com.Backend.services.admin_service.model.AdminStatsDTO;
import com.Backend.services.admin_service.model.AdminUserDTO;
import com.Backend.services.user_service.model.ROLE;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.services.chat_service.repository.ChatRepository;
import com.Backend.services.chat_service.message.repository.MessageRepository;
import com.Backend.services.friend_service.model.Status;
import com.Backend.services.friend_service.repository.FriendRepo;
import com.Backend.services.review_service.repository.ReviewRepository;
import com.Backend.services.watchlist_service.repository.WatchlistRepository;
import com.Backend.websocket.eventListener.STOMPEventListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {
    private final UserRepository userRepository;
    private final ChatRepository chatRepository;
    private final MessageRepository messageRepository;
    private final FriendRepo friendRepo;
    private final ReviewRepository reviewRepository;
    private final WatchlistRepository watchlistRepository;
    private final STOMPEventListener stompEventListener;

    @Transactional(readOnly = true)
    public Page<AdminUserDTO> listUsers(String query, Pageable pageable) {
        Page<User> page = (query == null || query.isBlank())
                ? userRepository.findAll(pageable)
                : userRepository.findByUsernameContainingIgnoreCase(query, pageable);
        return page.map(u -> new AdminUserDTO(
                u.getId(),
                u.getEmail(),
                u.getRealUsername(),
                u.getRole() != null ? u.getRole().name() : ROLE.ROLE_USER.name()
        ));
    }

    @Transactional(readOnly = true)
    public AdminUserDTO getUser(Long id) {
        User u = userRepository.findById(id).orElseThrow();
        return new AdminUserDTO(
                u.getId(),
                u.getEmail(),
                u.getRealUsername(),
                u.getRole() != null ? u.getRole().name() : ROLE.ROLE_USER.name()
        );
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "userMeDTO", key = "#updated.email"),
            @CacheEvict(value = "userSearch", allEntries = true),
            @CacheEvict(value = "userSearchCache", allEntries = true),
            @CacheEvict(value = "allUsersDTO", key = "'all'"),
            @CacheEvict(value = "users", key = "#updated.id")
    })
    public AdminUserDTO updateRole(Long id, String role) {
        ROLE newRole = ROLE.valueOf(role);
        User updated = userRepository.findById(id).orElseThrow();

        if (newRole == ROLE.ROLE_USER && updated.getRole() == ROLE.ROLE_ADMIN) {
            long currentAdmins = userRepository.countByRole(ROLE.ROLE_ADMIN);
            if (currentAdmins <= 1) {
                throw new IllegalArgumentException("Cannot demote the last remaining admin");
            }
        }
        updated.setRole(newRole);
        return new AdminUserDTO(
                updated.getId(),
                updated.getEmail(),
                updated.getRealUsername(),
                updated.getRole().name()
        );
    }

    @Transactional(readOnly = true)
    public AdminStatsDTO getSummary() {
        long usersTotal = userRepository.count();
        long adminsTotal = userRepository.countByRole(ROLE.ROLE_ADMIN);
        long chatsTotal = chatRepository.count();
        long messagesTotal = messageRepository.count();
        long friendshipsAccepted = friendRepo.countByStatus(Status.ACCEPTED);
        long friendshipsPending = friendRepo.countByStatus(Status.PENDING);
        long reviewsTotal = reviewRepository.count();
        long reviewsRepliesTotal = reviewRepository.countByAnswerToIsNotNull();
        long watchlistedMoviesTotal = watchlistRepository.countAllWatchlistedMovies();
        long watchlistedSeriesTotal = watchlistRepository.countAllWatchlistedSeries();
        int onlineUsers = stompEventListener.getOnlineUserCount();
        return new AdminStatsDTO(
                usersTotal,
                adminsTotal,
                chatsTotal,
                messagesTotal,
                friendshipsAccepted,
                friendshipsPending,
                reviewsTotal,
                reviewsRepliesTotal,
                watchlistedMoviesTotal,
                watchlistedSeriesTotal,
                onlineUsers
        );
    }
}
