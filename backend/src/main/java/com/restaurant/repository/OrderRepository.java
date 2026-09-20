package com.restaurant.repository;

import com.restaurant.entity.CustomerOrder;
import com.restaurant.enums.OrderStatus;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    boolean existsByOrderNumber(String orderNumber);
    boolean existsByRestaurantTableId(Long restaurantTableId);
    List<CustomerOrder> findByStatus(OrderStatus status);
    List<CustomerOrder> findByStatusIn(List<OrderStatus> statuses);
    List<CustomerOrder> findByRestaurantTableTableNumberAndStatusNotIn(Integer tableNumber, List<OrderStatus> statuses);
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByStatus(OrderStatus status);
    List<CustomerOrder> findByCreatedAtAfter(LocalDateTime date);
}