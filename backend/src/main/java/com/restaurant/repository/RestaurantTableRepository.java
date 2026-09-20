package com.restaurant.repository;

import com.restaurant.entity.RestaurantTable;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> {
    Optional<RestaurantTable> findByTableNumber(Integer tableNumber);
    boolean existsByTableNumber(Integer tableNumber);
    boolean existsByTableNumberAndIdNot(Integer tableNumber, Long id);
}