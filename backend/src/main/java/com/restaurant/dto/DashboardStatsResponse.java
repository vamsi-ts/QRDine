package com.restaurant.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardStatsResponse(
        long totalOrders,
        long todaysOrders,
        long activeOrders,
        long completedOrders,
        BigDecimal totalSales,
        List<DailyRevenue> revenueChartWeekly,
        List<DailyRevenue> revenueChartMonthly,
        List<DailyRevenue> revenueChartYearly,
        List<TopItem> topItems
) {
}