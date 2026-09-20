package com.restaurant.dto;

import com.restaurant.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;

public record SettlePaymentRequest(
        @NotNull PaymentMethod paymentMethod
) {
}
