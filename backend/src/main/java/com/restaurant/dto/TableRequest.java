package com.restaurant.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record TableRequest(
        @NotNull @Min(1) Integer tableNumber,
        boolean active
) {
}