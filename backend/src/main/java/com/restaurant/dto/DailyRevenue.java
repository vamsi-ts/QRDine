package com.restaurant.dto;

import java.math.BigDecimal;

public record DailyRevenue(String date, BigDecimal sales, long orders) {}
