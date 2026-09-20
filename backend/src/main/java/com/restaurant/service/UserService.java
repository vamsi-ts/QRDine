package com.restaurant.service;

import com.restaurant.dto.UserRequest;
import com.restaurant.dto.UserResponse;
import com.restaurant.entity.User;
import com.restaurant.enums.Role;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAll() {
        return userRepository.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse getById(Long id) {
        return toResponse(find(id));
    }

    public UserResponse create(UserRequest request) {
        if (request.password() == null || request.password().isBlank()) {
            throw new BadRequestException("Password is required");
        }
        if (request.role() == Role.CUSTOMER) {
            throw new BadRequestException("Customers do not need staff accounts");
        }
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already exists");
        }
        User user = new User();
        apply(user, request);
        user.setPassword(passwordEncoder.encode(request.password()));
        return toResponse(userRepository.save(user));
    }

    public UserResponse update(Long id, UserRequest request) {
        User user = find(id);
        if (request.role() == Role.CUSTOMER) {
            throw new BadRequestException("Customers do not need staff accounts");
        }
        if (userRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new BadRequestException("Email already exists");
        }
        apply(user, request);
        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        return toResponse(userRepository.save(user));
    }

    public void delete(Long id) {
        userRepository.delete(find(id));
    }

    User find(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.isActive(), user.getCreatedAt());
    }

    private void apply(User user, UserRequest request) {
        user.setName(request.name());
        user.setEmail(request.email());
        user.setRole(request.role());
        user.setActive(request.active());
    }
}