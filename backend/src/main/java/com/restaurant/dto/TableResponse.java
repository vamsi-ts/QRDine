package com.restaurant.dto;

import java.time.LocalDateTime;

public record TableResponse(Long id, Integer tableNumber, boolean active, String qrCodeUrl, LocalDateTime createdAt) {
}