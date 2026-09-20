package com.restaurant.service;

import com.restaurant.dto.DashboardStatsResponse;
import com.restaurant.dto.OrderEvent;
import com.restaurant.dto.OrderItemRequest;
import com.restaurant.dto.OrderItemResponse;
import com.restaurant.dto.OrderRequest;
import com.restaurant.dto.OrderResponse;
import com.restaurant.dto.DailyRevenue;
import com.restaurant.dto.TopItem;
import com.restaurant.entity.CustomerOrder;
import com.restaurant.entity.MenuItem;
import com.restaurant.entity.OrderItem;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.PaymentMethod;
import com.restaurant.enums.Role;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.OrderRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final OrderRepository orderRepository;
    private final RestaurantTableService tableService;
    private final MenuItemService menuItemService;
    private final SimpMessagingTemplate messagingTemplate;

    public List<OrderResponse> getAll(OrderStatus status, Role role) {
        List<OrderStatus> allowedStatuses = allowedStatuses(role);
        if (status != null && !allowedStatuses.contains(status)) {
            throw new BadRequestException("Role " + role + " cannot view " + status + " orders");
        }
        List<CustomerOrder> orders = status == null
                ? orderRepository.findByStatusIn(allowedStatuses)
                : orderRepository.findByStatus(status);
        return orders.stream().map(this::toResponse).toList();
    }

    public OrderResponse getById(Long id) {
        return toResponse(find(id));
    }

    @Transactional
    public OrderResponse create(OrderRequest request) {
        RestaurantTable table = tableService.findActiveByNumber(request.tableNumber());
        CustomerOrder order = new CustomerOrder();
        order.setOrderNumber(generateOrderNumber());
        order.setRestaurantTable(table);
        order.setStatus(OrderStatus.NEW);

        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest itemRequest : request.items()) {
            MenuItem menuItem = menuItemService.find(itemRequest.menuItemId());
            if (!menuItem.isAvailable()) {
                throw new BadRequestException(menuItem.getName() + " is unavailable");
            }
            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setMenuItem(menuItem);
            item.setQuantity(itemRequest.quantity());
            item.setPrice(menuItem.getPrice());
            item.setSpecialInstruction(itemRequest.specialInstruction());
            order.getItems().add(item);
            total = total.add(menuItem.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantity())));
        }
        order.setTotalAmount(total);
        OrderResponse response = toResponse(orderRepository.save(order));
        publish("NEW_ORDER", response);
        return response;
    }

    @Transactional
    public OrderResponse updateStatus(Long id, OrderStatus nextStatus, Role role, PaymentMethod paymentMethod) {
        CustomerOrder order = find(id);
        validateTransition(order.getStatus(), nextStatus, role);
        order.setStatus(nextStatus);
        if (nextStatus == OrderStatus.PAID && paymentMethod != null) {
            order.setPaymentMethod(paymentMethod);
        }
        OrderResponse response = toResponse(orderRepository.save(order));
        publish("ORDER_UPDATED", response);
        return response;
    }

    @Transactional
    public List<OrderResponse> settleTablePayment(Integer tableNumber, PaymentMethod paymentMethod) {
        List<CustomerOrder> activeOrders = orderRepository.findByRestaurantTableTableNumberAndStatusNotIn(
                tableNumber, List.of(OrderStatus.PAID, OrderStatus.CANCELLED)
        );
        if (activeOrders.isEmpty()) {
            throw new BadRequestException("No active unpaid orders found for table " + tableNumber);
        }
        for (CustomerOrder order : activeOrders) {
            order.setStatus(OrderStatus.PAID);
            order.setPaymentMethod(paymentMethod);
            orderRepository.save(order);
        }
        List<OrderResponse> responses = activeOrders.stream().map(this::toResponse).toList();
        if (!responses.isEmpty()) {
            publish("TABLE_PAYMENT_SETTLED", responses.get(0));
        }
        return responses;
    }

    public List<OrderResponse> getActiveOrdersForTable(Integer tableNumber) {
        return orderRepository.findByRestaurantTableTableNumberAndStatusNotIn(
                tableNumber, List.of(OrderStatus.PAID, OrderStatus.CANCELLED)
        ).stream().map(this::toResponse).toList();
    }

    public DashboardStatsResponse dashboardStats() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = start.plusDays(1);
        long active = orderRepository.countByStatus(OrderStatus.NEW)
                + orderRepository.countByStatus(OrderStatus.ACCEPTED)
                + orderRepository.countByStatus(OrderStatus.PREPARING)
                + orderRepository.countByStatus(OrderStatus.READY);
        
        List<CustomerOrder> completedOrders = java.util.stream.Stream.concat(
                orderRepository.findByStatus(OrderStatus.DELIVERED).stream(),
                orderRepository.findByStatus(OrderStatus.PAID).stream()
        ).toList();
        
        BigDecimal totalSales = completedOrders.stream()
                .map(order -> order.getTotalAmount() != null ? order.getTotalAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
                
        List<DailyRevenue> revenueChartWeekly = calculateChartData(completedOrders, start, "weekly");
        List<DailyRevenue> revenueChartMonthly = calculateChartData(completedOrders, start, "monthly");
        List<DailyRevenue> revenueChartYearly = calculateChartData(completedOrders, start, "yearly");

        
        // Calculate Top Items
        Map<String, Long> itemCounts = completedOrders.stream()
                .flatMap(o -> o.getItems().stream())
                .collect(Collectors.groupingBy(
                        i -> i.getMenuItem().getName(),
                        Collectors.summingLong(OrderItem::getQuantity)
                ));
                
        List<TopItem> topItems = itemCounts.entrySet().stream()
                .map(e -> new TopItem(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.quantitySold(), a.quantitySold()))
                .limit(5)
                .toList();

        return new DashboardStatsResponse(
                orderRepository.count(),
                orderRepository.countByCreatedAtBetween(start, end),
                active,
                completedOrders.size(),
                totalSales,
                revenueChartWeekly,
                revenueChartMonthly,
                revenueChartYearly,
                topItems
        );
    }
    
    private List<DailyRevenue> calculateChartData(List<CustomerOrder> allCompletedOrders, LocalDateTime start, String type) {
        List<DailyRevenue> chart = new ArrayList<>();
        if (type.equals("monthly")) {
            int currentYear = start.getYear();
            Map<Integer, List<CustomerOrder>> grouped = allCompletedOrders.stream()
                .filter(o -> o.getCreatedAt().getYear() == currentYear)
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().getMonthValue()));
            for (int i = 1; i <= 12; i++) {
                String monthName = java.time.Month.of(i).getDisplayName(java.time.format.TextStyle.SHORT, java.util.Locale.ENGLISH);
                BigDecimal sales = grouped.getOrDefault(i, Collections.emptyList()).stream()
                    .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                chart.add(new DailyRevenue(monthName, sales, grouped.getOrDefault(i, Collections.emptyList()).size()));
            }
        } else if (type.equals("yearly")) {
            int currentYear = start.getYear();
            Map<Integer, List<CustomerOrder>> grouped = allCompletedOrders.stream()
                .filter(o -> o.getCreatedAt().getYear() > currentYear - 5)
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().getYear()));
            for (int i = 4; i >= 0; i--) {
                int year = currentYear - i;
                BigDecimal sales = grouped.getOrDefault(year, Collections.emptyList()).stream()
                    .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                chart.add(new DailyRevenue(String.valueOf(year), sales, grouped.getOrDefault(year, Collections.emptyList()).size()));
            }
        } else {
            Map<String, List<CustomerOrder>> grouped = allCompletedOrders.stream()
                .filter(o -> o.getCreatedAt().isAfter(start.minusDays(6)))
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd"))));
            for (int i = 6; i >= 0; i--) {
                String dateStr = start.minusDays(i).format(DateTimeFormatter.ofPattern("MMM dd"));
                BigDecimal sales = grouped.getOrDefault(dateStr, Collections.emptyList()).stream()
                    .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                chart.add(new DailyRevenue(dateStr, sales, grouped.getOrDefault(dateStr, Collections.emptyList()).size()));
            }
        }
        return chart;
    }

    CustomerOrder find(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Order not found"));
    }

    public OrderResponse toResponse(CustomerOrder order) {
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getRestaurantTable().getTableNumber(),
                order.getStatus(),
                order.getPaymentMethod(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                order.getItems().stream().map(this::toItemResponse).toList()
        );
    }

    private OrderItemResponse toItemResponse(OrderItem item) {
        return new OrderItemResponse(
                item.getId(),
                item.getMenuItem().getId(),
                item.getMenuItem().getName(),
                item.getQuantity(),
                item.getPrice(),
                item.getSpecialInstruction()
        );
    }

    private void validateTransition(OrderStatus current, OrderStatus next, Role role) {
        boolean allowed = role == Role.WAITER && current == OrderStatus.NEW && next == OrderStatus.ACCEPTED
                || role == Role.KITCHEN && current == OrderStatus.ACCEPTED && next == OrderStatus.PREPARING
                || role == Role.KITCHEN && current == OrderStatus.PREPARING && next == OrderStatus.READY
                || role == Role.WAITER && current == OrderStatus.READY && next == OrderStatus.DELIVERED
                || role == Role.ADMIN && next == OrderStatus.PAID
                || role == Role.ADMIN && next == OrderStatus.CANCELLED;
        if (!allowed) {
            throw new BadRequestException("Invalid status transition from " + current + " to " + next + " for role " + role);
        }
    }

    private List<OrderStatus> allowedStatuses(Role role) {
        if (role == Role.ADMIN) {
            return List.of(OrderStatus.NEW, OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.DELIVERED, OrderStatus.PAID, OrderStatus.CANCELLED);
        }
        if (role == Role.WAITER) {
            return List.of(OrderStatus.NEW, OrderStatus.ACCEPTED, OrderStatus.READY, OrderStatus.DELIVERED, OrderStatus.PAID);
        }
        if (role == Role.KITCHEN) {
            return List.of(OrderStatus.ACCEPTED, OrderStatus.PREPARING, OrderStatus.READY);
        }
        throw new BadRequestException("Role " + role + " cannot view staff orders");
    }

    private String generateOrderNumber() {
        String value;
        do {
            value = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (orderRepository.existsByOrderNumber(value));
        return value;
    }

    private void publish(String type, OrderResponse order) {
        OrderEvent event = new OrderEvent(type, order);
        messagingTemplate.convertAndSend("/topic/orders", event);
        messagingTemplate.convertAndSend(type.equals("NEW_ORDER") ? "/topic/orders/new" : "/topic/orders/updated", event);
    }
}