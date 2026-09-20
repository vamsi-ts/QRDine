package com.restaurant.dto;

public record OrderEvent(String type, OrderResponse order) {
}