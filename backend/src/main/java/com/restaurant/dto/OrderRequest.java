package com.restaurant.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record OrderRequest(
        @NotNull @Min(1) Integer tableNumber,
        @NotEmpty List<@Valid OrderItemRequest> items
) {
}