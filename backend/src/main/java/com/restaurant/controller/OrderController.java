package com.restaurant.controller;

import com.restaurant.dto.DashboardStatsResponse;
import com.restaurant.dto.OrderRequest;
import com.restaurant.dto.OrderResponse;
import com.restaurant.dto.SettlePaymentRequest;
import com.restaurant.dto.StatusUpdateRequest;
import com.restaurant.enums.OrderStatus;
import com.restaurant.enums.Role;
import com.restaurant.service.OrderService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','WAITER','KITCHEN')")
    public List<OrderResponse> getAll(@RequestParam(required = false) OrderStatus status, Authentication authentication) {
        return orderService.getAll(status, currentRole(authentication));
    }

    @GetMapping("/{id}")
    public OrderResponse getById(@PathVariable Long id) {
        return orderService.getById(id);
    }

    @PostMapping
    public OrderResponse create(@Valid @RequestBody OrderRequest request) {
        return orderService.create(request);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN','WAITER','KITCHEN')")
    public OrderResponse updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request, Authentication authentication) {
        return orderService.updateStatus(id, request.status(), currentRole(authentication), request.paymentMethod());
    }

    @PutMapping("/tables/{tableNumber}/settle-payment")
    @PreAuthorize("hasRole('ADMIN')")
    public List<OrderResponse> settleTablePayment(@PathVariable Integer tableNumber, @Valid @RequestBody SettlePaymentRequest request) {
        return orderService.settleTablePayment(tableNumber, request.paymentMethod());
    }

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public DashboardStatsResponse stats() {
        return orderService.dashboardStats();
    }

    @GetMapping("/table/{tableNumber}")
    public List<OrderResponse> getActiveOrdersForTable(@PathVariable Integer tableNumber) {
        return orderService.getActiveOrdersForTable(tableNumber);
    }

    private Role currentRole(Authentication authentication) {
        String authority = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return Role.valueOf(authority);
    }
}