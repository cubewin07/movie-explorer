package com.Backend.services.user_service.model;

import com.Backend.exception.UserNotFoundException;
import com.Backend.services.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserLookUpHelper {
    private final UserRepository userRepository;

    public User getUserById(Long id) {
        log.debug("Fetching user by id={} from database", id);
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException("User with id " + id + " not found"));
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

    @Transactional(readOnly = true)
    public User getUserWithRequestsTo(Long id) {
        log.debug("Fetching user with requestsTo by id={} from database", id);
        return userRepository.findWithRequestsToById(id)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public User getUserWithRequestsFrom(Long id) {
        log.debug("Fetching user with requestsFrom by id={} from database", id);
        return userRepository.findWithRequestsFrom(id)
                .orElse(null);
    }

}
