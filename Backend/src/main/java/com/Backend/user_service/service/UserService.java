package com.Backend.user_service.service;

import com.Backend.user_service.model.RegisterDTO;
import com.Backend.user_service.model.User;
import com.Backend.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public String registerUser(RegisterDTO registerDTO) {
        return null;
    }

    public void deleteUserById(Long id) {
        if (!userRepository.existsById(id))
            throw new IllegalArgumentException("User with id " + id + " does not exist");
        userRepository.deleteById(id);
    }

}
