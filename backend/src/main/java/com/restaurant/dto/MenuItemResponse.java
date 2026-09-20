package com.restaurant.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MenuItemResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String imageUrl,
        CategoryResponse category,
        boolean available,
        LocalDateTime createdAt
) {
}