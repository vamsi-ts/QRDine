package com.restaurant.dto;

import com.restaurant.enums.Role;

public record AuthResponse(String token, Role role, String name) {
}