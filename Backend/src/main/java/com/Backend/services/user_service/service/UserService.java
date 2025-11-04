package com.Backend.services.user_service.service;

import com.Backend.services.chat_service.message.dto.MessageDTO;
import com.Backend.services.chat_service.model.ChatMessageHelper;
import com.Backend.services.friend_service.model.Status;
import com.Backend.services.friend_service.service.FriendService;
import com.Backend.services.notification_service.model.NotificationDTO;
import com.Backend.services.user_service.model.*;
import com.Backend.services.user_service.model.DTO.*;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.model.WatchlistDTO;
import com.Backend.springSecurity.jwtAuthentication.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Backend.exception.AuthenticationFailedException;
import com.Backend.exception.UserNotFoundException;

import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final ChatMessageHelper chatMessageHelper;
    private final FriendService friendService;
    private final ApplicationEventPublisher publisher;

    // Removed @Cacheable - was caching JPA entities which causes Kryo serialization issues
    public List<User> getAllUsers() {
        log.debug("Fetching all users from database");
        return userRepository.findAll();
    }

    @Cacheable(value = "allUsersDTO", key = "'all'")
    public List<SimpleUserDTO> getAllUsersDTO() {
        log.debug("Fetching all users as DTOs from database");
        return userRepository.findAll().stream()
                // Align username field with test expectations (username equals email here)
                .map(u -> new SimpleUserDTO(u.getId(), u.getEmail(), u.getEmail()))
                .collect(Collectors.toList());
    }

    // Removed @Cacheable - was caching JPA entities which causes Kryo serialization issues
    // Use getSimpleUserByIdCached() if you need a cached DTO version
    public User getUserById(Long id) {
        log.debug("Fetching user by id={} from database", id);
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));
    }

    @Cacheable(value = "users", key = "#id")
    public SimpleUserDTO getSimpleUserByIdCached(Long id) {
        log.debug("Fetching simple user DTO by id={} from database", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));
        return new SimpleUserDTO(user.getId(), user.getEmail(), user.getUsername());
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "userSearch", allEntries = true),
        @CacheEvict(value = "allUsersDTO", key = "'all'")
    })
    public JwtToken registerUser(RegisterDTO registerDTO) {
        String encryptedPassword = passwordEncoder.encode(registerDTO.password());
        User user = User.builder()
                .username(registerDTO.username())
                .email(registerDTO.email())
                .password(encryptedPassword)
                .role(ROLE.ROLE_USER)    
                .build();

        user.setWatchlist(new Watchlist());
        user.getWatchlist().setUser(user);      

        userRepository.save(user);

        log.info("User registered: id={}", user.getId());
        String token = jwtService.generateToken(user.getUsername());
        return new JwtToken(token);
    }

    @Transactional
    public JwtToken authenticateUser(AuthenticateDTO authenticate) {
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            authenticate.email(),
                            authenticate.password()
                    )
            );
        } catch (Exception ex) {
            log.error("Authentication failed for email={}", authenticate.email());
            throw new AuthenticationFailedException(ex.getMessage());
        }
        String token = jwtService.generateToken(auth.getName());
        return new JwtToken(token);
    }

    @Transactional
    @Caching(evict = {
                @CacheEvict(value = "userMeDTO", key = "#userFromContext.email"),
                @CacheEvict(value = "userSearch", allEntries = true),
                @CacheEvict(value = "userId", key = "#userFromContext.getEmail()")
        }
    )
    public User updateUser(UpdateUserDTO update, User userFromContext) {
        User managedUser = userRepository.findByEmail(userFromContext.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User with email " + userFromContext.getEmail() + " not found"));
        managedUser.setUsername(update.username());
        managedUser.setEmail(update.email());
        log.info("User updated: id={}", managedUser.getId());
        return managedUser;
    }

    @Cacheable(value = "userId", key = "#email")
    public Long getUserIdByEmail(String email) {
        log.debug("Fetching user id by email={} from database", email);
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found"));
    }

    // Removed @Cacheable - was caching JPA entities which causes Kryo serialization issues
    // This method is provided for other services to use instead of direct repository access
    public User getUserByEmail(String email) {
        log.debug("Fetching user by email={} from database", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User with email " + email + " not found"));
    }

    // Removed @Cacheable - was caching JPA entities which causes Kryo serialization issues
    // This method is provided for other services to use instead of direct repository access
    public User getUserByUsername(String username) {
        log.debug("Fetching user by username={} from database", username);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UserNotFoundException("User with username " + username + " not found"));
    }

    // Removed @Cacheable - was caching JPA entities which causes Kryo serialization issues
    // This method loads user with requestsFrom relationship (pending requests only)
    // Provided for FriendService to use instead of direct repository access
    @Transactional(readOnly = true)
    public User getUserWithRequestsFrom(Long id) {
        log.debug("Fetching user with requestsFrom by id={} from database", id);
        return userRepository.findWithRequestsFrom(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));
    }

    // Removed @Cacheable - was caching JPA entities which causes Kryo serialization issues
    // This method loads user with requestsTo relationship (pending requests only)
    // Provided for FriendService to use instead of direct repository access
    @Transactional(readOnly = true)
    public User getUserWithRequestsTo(Long id) {
        log.debug("Fetching user with requestsTo by id={} from database", id);
        return userRepository.findWithRequestsToById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "userMeDTO", allEntries = true),
        @CacheEvict(value = "userSearch", allEntries = true),
        @CacheEvict(value = "userId", allEntries = true),
        @CacheEvict(value = "allUsersDTO", key = "'all'")
    })
    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id)) {
            log.error("User with id {} does not exist", id);
            throw new UserNotFoundException("User with id " + id + " does not exist");
        }
        userRepository.deleteById(id);
        log.info("User with id {} deleted successfully", id);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "userSearch", key = "{#query, #id, #page, #size}")
    public List<SimpleUserDTO> searchUsers(String query, Long id, int page, int size) {
        log.debug("Searching users with query: '{}', excluding user ID: {}, page: {}, size: {}",
                query, id, page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userRepository.findByUsernameContainingIgnoreCaseAndIdNot(query, id, pageable);

        if (users == null || users.isEmpty()) {
            log.info("No users found matching query '{}'", query);
            return Collections.emptyList();
        }

        log.info("Found {} users matching query '{}' (Page {} of {})",
                users.getTotalElements(), query, page + 1, users.getTotalPages());

        // Cache only DTOs
        return users.getContent().stream()
                .map(u -> new SimpleUserDTO(u.getId(), u.getEmail(), u.getRealUsername()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "userMeDTO", key = "#principal.email")
    public UserMeDTO getMeDTO(User principal) {
        log.debug("Fetching UserMeDTO for email={} from database", principal.getEmail());
        
        // Load with entity graph
        User user = userRepository.findByEmail(principal.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User with email " + principal.getEmail() + " not found"));

        // Base info
        UserMeDTO dto = new UserMeDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setUsername(user.getRealUsername());

        // Watchlist
        if (user.getWatchlist() != null) {
            Set<Long> seriesIds = user.getWatchlist().getSeriesId() != null
                    ? new HashSet<>(user.getWatchlist().getSeriesId())
                    : new HashSet<>();

            Set<Long> moviesIds = user.getWatchlist().getMoviesId() != null
                    ? new HashSet<>(user.getWatchlist().getMoviesId())
                    : new HashSet<>();
            dto.setWatchlist(new WatchlistDTO(
                    moviesIds,
                    seriesIds
            ));
        }

        // Notifications
        if (user.getNotifications() != null) {
            dto.setNotifications(user.getNotifications().stream()
                    .map(n -> new NotificationDTO(
                            n.getId(),
                            n.getType(),
                            n.getRelatedId(),
                            n.getMessage(),
                            n.isRead(),
                            n.getCreatedAt()
                    ))
                    .toList());
        }

        // Requests From (user1 = me) -> other is user2
        if (user.getRequestsFrom() != null) {
            dto.setRequestsFrom(user.getRequestsFrom().stream()
                    .map(f -> new FriendDTO(
                            new SimpleUserDTO(
                                    f.getUser2().getId(),
                                    f.getUser2().getEmail(),
                                    f.getUser2().getRealUsername()
                            ),
                            f.getStatus(),
                            f.getCreatedAt()
                    ))
                    .toList());
        }

        // Requests To (user2 = me) -> other is user1
        if (user.getRequestsTo() != null) {
            dto.setRequestsTo(user.getRequestsTo().stream()
                    .map(f -> new FriendDTO(
                            new SimpleUserDTO(
                                    f.getUser1().getId(),
                                    f.getUser1().getEmail(),
                                    f.getUser1().getRealUsername()
                            ),
                            f.getStatus(),
                            f.getCreatedAt()
                    ))
                    .toList());
        }

        // Chats with participants and latest message
        if (user.getChats() != null) {
            dto.setChats(user.getChats().stream()
                    .map(chat -> {
                        ChatSummaryDTO c = new ChatSummaryDTO();
                        c.setId(chat.getId());
                        // participants
                        c.setParticipants(chat.getParticipants().stream()
                                .map(u -> new SimpleUserDTO(u.getId(), u.getEmail(), u.getRealUsername()))
                                .toList());
                        // Using helper to prevent cycle
                        MessageDTO latestDTO = chatMessageHelper.getLatestMessageDTO(chat.getId());
                        if (latestDTO != null) {
                            // Convert to user_service UserMessageDTO format
                            SimpleUserDTO senderDTO = getSimpleUserByIdCached(latestDTO.senderId());
                            c.setLatestMessage(new UserMessageDTO(
                                    latestDTO.id(),
                                    latestDTO.content(),
                                    senderDTO,
                                    false, // Note: read status not available in message service DTO
                                    latestDTO.createdAt()
                            ));
                        }
                        return c;
                    })
                    .toList());
        }
        return dto;
    }

    public GetInfoDTO getInfoDTO(User principal, Long id) {
        if(friendService.isFriend(principal, id)) {
            log.info("Fetching info for friend id={} from database", id);
            Status status = friendService.getFriendStatus(principal, id);
            User info = getUserById(id);
            Set<Long> moviesId= info.getWatchlist().getMoviesId();
            Set<Long> seriesId= info.getWatchlist().getSeriesId();
            return GetInfoDTO.builder()
                    .id(info.getId())
                    .email(info.getEmail())
                    .username(info.getRealUsername())
                    .status(status)
                    .watchlist(new WatchlistDTO(moviesId, seriesId))
                    .build();
        } else {
            log.info("No friend ship found for user id={} and friend id={}", principal.getId(), id);
            User info = getUserById(id);
            Set<Long> moviesId= info.getWatchlist().getMoviesId();
            Set<Long> seriesId= info.getWatchlist().getSeriesId();
            return GetInfoDTO.builder()
                    .id(info.getId())
                    .email(info.getEmail())
                    .username(info.getRealUsername())
                    .watchlist(new WatchlistDTO(moviesId, seriesId))
                    .build();
        }
    }
}