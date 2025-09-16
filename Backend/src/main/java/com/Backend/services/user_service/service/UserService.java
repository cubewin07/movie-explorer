package com.Backend.services.user_service.service;

import com.Backend.services.user_service.model.*;
import com.Backend.services.user_service.repository.UserRepository;
import com.Backend.springSecurity.jwtAuthentication.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

@RequiredArgsConstructor
@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow();
    }

    @Transactional
    public JwtToken registerUser(RegisterDTO registerDTO) {
        String encryptedPassword = passwordEncoder.encode(registerDTO.password());
        User user = User.builder()
                .username(registerDTO.username())
                .email(registerDTO.email())
                .password(encryptedPassword)
                .build();
        userRepository.save(user);
        String token = jwtService.generateToken(user.getUsername());
        return new JwtToken(token);
    }

    @Transactional
    public JwtToken authenticateUser(AuthenticateDTO authenticate) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        authenticate.email(),
                        authenticate.password()
                )
        );
        String token = jwtService.generateToken(auth.getName());
        return new JwtToken(token);

    }

    @Transactional
    public User updateUser(UpdateUserDTO update, User userFromContext) {
        User managedUser = userRepository.findByEmail(userFromContext.getEmail()).orElseThrow();
        managedUser.setUsername(update.username());
        managedUser.setEmail(update.email());
        return managedUser;
    }

    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id))
            throw new IllegalArgumentException("User with id " + id + " does not exist");
        userRepository.deleteById(id);
    }

}
