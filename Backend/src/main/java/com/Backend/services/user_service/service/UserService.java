package com.Backend.services.user_service.service;

import com.Backend.services.user_service.model.*;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.springSecurity.jwtAuthentication.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public List<User> getAllUsers() {
        log.info("Retrieving all users");
        List<User> users = userRepository.findAll();
        log.info("Successfully retrieved {} users", users.size());
        return users;
    }

    public User getUserById(Long id) {
        log.info("Retrieving user with id: {}", id);
        User user = userRepository.findById(id).orElseThrow();
        log.info("Successfully retrieved user: {}", user.getUsername());
        return user;
    }

    @Transactional
    public JwtToken registerUser(RegisterDTO registerDTO) {
        log.info("Starting user registration for email: {}", registerDTO.email());
        String encryptedPassword = passwordEncoder.encode(registerDTO.password());
        User user = User.builder()
                .username(registerDTO.username())
                .email(registerDTO.email())
                .password(encryptedPassword)
                .build();
        userRepository.save(user);
        log.info("User registered successfully with id: {}", user.getId());
        String token = jwtService.generateToken(user.getUsername());
        log.info("JWT token generated for user: {}", user.getUsername());
        return new JwtToken(token);
    }

    @Transactional
    public JwtToken authenticateUser(AuthenticateDTO authenticate) {
        log.info("Starting user authentication for email: {}", authenticate.email());
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authenticate.email(),
                        authenticate.password()
                )
        );
        log.info("User authentication successful for: {}", auth.getName());
        String token = jwtService.generateToken(auth.getName());
        log.info("JWT token generated for authenticated user: {}", auth.getName());
        return new JwtToken(token);

    }

    @Transactional
    public User updateUser(UpdateUserDTO update, User userFromContext) {
        log.info("Starting user update for user id: {}", userFromContext.getId());
        User managedUser = userRepository.findByEmail(userFromContext.getEmail()).orElseThrow();
        log.info("Updating user details - old username: {}, new username: {}", 
                managedUser.getUsername(), update.username());
        managedUser.setUsername(update.username());
        managedUser.setEmail(update.email());
        log.info("User update completed successfully for user id: {}", managedUser.getId());
        return managedUser;
    }

    public void deleteUserById(Long id) {
        log.info("Attempting to delete user with id: {}", id);
        if (!userRepository.existsById(id)) {
            log.error("User with id {} does not exist", id);
            throw new IllegalArgumentException("User with id " + id + " does not exist");
        }
        userRepository.deleteById(id);
        log.info("User with id {} deleted successfully", id);
    }

}
