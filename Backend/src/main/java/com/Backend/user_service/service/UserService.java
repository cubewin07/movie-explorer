package com.Backend.user_service.service;

import com.Backend.springSecurity.jwtAuthentication.JwtService;
import com.Backend.user_service.model.JwtToken;
import com.Backend.user_service.model.RegisterDTO;
import com.Backend.user_service.model.User;
import com.Backend.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;

@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
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

    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id))
            throw new IllegalArgumentException("User with id " + id + " does not exist");
        userRepository.deleteById(id);
    }

}
