package com.restaurant.dto;

import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record StatusUpdateRequest(
        @NotNull OrderStatus status,
        PaymentMethod paymentMethod
) {
}