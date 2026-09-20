package com.restaurant.dto;

import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.PaymentMethod;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        Integer tableNumber,
        OrderStatus status,
        PaymentMethod paymentMethod,
        BigDecimal totalAmount,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<OrderItemResponse> items
) {
}