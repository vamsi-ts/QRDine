package com.restaurant.dto;

import com.restaurant.enums.Role;
import java.time.LocalDateTime;

public record UserResponse(Long id, String name, String email, Role role, boolean active, LocalDateTime createdAt) {
}