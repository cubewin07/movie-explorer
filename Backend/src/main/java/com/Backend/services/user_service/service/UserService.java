package com.Backend.services.user_service.service;

import com.Backend.services.user_service.model.*;
import com.Backend.services.user_service.model.DTO.AuthenticateDTO;
import com.Backend.services.user_service.model.DTO.ChatSummaryDTO;
import com.Backend.services.user_service.model.DTO.FriendDTO;
import com.Backend.services.user_service.model.DTO.MessageDTO;
import com.Backend.services.user_service.model.DTO.NotificationDTO;
import com.Backend.services.user_service.model.DTO.RegisterDTO;
import com.Backend.services.user_service.model.DTO.SimpleUserDTO;
import com.Backend.services.user_service.model.DTO.UpdateUserDTO;
import com.Backend.services.user_service.model.DTO.UserMeDTO;
import com.Backend.services.user_service.model.DTO.WatchlistDTO;
import com.Backend.services.chat_service.message.service.MessageService;
import com.Backend.services.chat_service.message.model.Message;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.springSecurity.jwtAuthentication.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
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

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final MessageService messageService;

    @Cacheable(value = "users", key = "'all'")
    public List<User> getAllUsers() {
        log.debug("Fetching all users from database");
        return userRepository.findAll();
    }

    @Cacheable(value = "users", key = "#id")
    public User getUserById(Long id) {
        log.debug("Fetching user by id={} from database", id);
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));
    }

    @Transactional
    @CacheEvict(value = "users", key = "'all'")
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
    @Caching(
        put = @CachePut(value = "users", key = "#result.id"),
        evict = {
            @CacheEvict(value = "users", key = "'all'"),
            @CacheEvict(value = "userMeDTO", key = "#userFromContext.email")
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

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "users", key = "#id"),
        @CacheEvict(value = "users", key = "'all'"),
        @CacheEvict(value = "userMeDTO", allEntries = true)
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
    public Page<SimpleUserDTO> searchUsers(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> users = userRepository.findByUsernameContainingIgnoreCase(query, pageable);
        return users.map(u -> new SimpleUserDTO(u.getId(), u.getEmail(), u.getRealUsername()));
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
                        // latest message via MessageService
                        Message latest = messageService.getLatestMessage(chat.getId());
                        if (latest != null) {
                            c.setLatestMessage(new MessageDTO(
                                    latest.getId(),
                                    latest.getContent(),
                                    new SimpleUserDTO(
                                            latest.getSender().getId(),
                                            latest.getSender().getEmail(),
                                            latest.getSender().getRealUsername()
                                    ),
                                    latest.isRead(),
                                    latest.getCreatedAt()
                            ));
                        }
                        return c;
                    })
                    .toList());
        }
        return dto;
    }
}