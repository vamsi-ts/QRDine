package com.restaurant.service;

import com.restaurant.dto.TableRequest;
import com.restaurant.dto.TableResponse;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.exception.BadRequestException;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.OrderRepository;
import com.restaurant.repository.RestaurantTableRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RestaurantTableService {
    private final RestaurantTableRepository tableRepository;
    private final OrderRepository orderRepository;

    @Value("${app.frontend-origin:http://localhost:5173}")
    private String frontendOrigin;

    public List<TableResponse> getAll() {
        return tableRepository.findAll().stream().map(this::toResponse).toList();
    }

    public TableResponse getById(Long id) {
        return toResponse(find(id));
    }

    public TableResponse create(TableRequest request) {
        if (tableRepository.existsByTableNumber(request.tableNumber())) {
            throw new BadRequestException("Table number already exists");
        }
        RestaurantTable table = new RestaurantTable();
        table.setTableNumber(request.tableNumber());
        table.setActive(request.active());
        return toResponse(tableRepository.save(table));
    }

    public TableResponse update(Long id, TableRequest request) {
        RestaurantTable table = find(id);
        if (tableRepository.existsByTableNumberAndIdNot(request.tableNumber(), id)) {
            throw new BadRequestException("Table number already exists");
        }
        table.setTableNumber(request.tableNumber());
        table.setActive(request.active());
        return toResponse(tableRepository.save(table));
    }

    public void delete(Long id) {
        if (orderRepository.existsByRestaurantTableId(id)) {
            throw new BadRequestException("Cannot delete a table that has orders. Deactivate it instead.");
        }
        tableRepository.delete(find(id));
    }

    RestaurantTable find(Long id) {
        return tableRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Table not found"));
    }

    RestaurantTable findActiveByNumber(Integer tableNumber) {
        RestaurantTable table = tableRepository.findByTableNumber(tableNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Table not found"));
        if (!table.isActive()) {
            throw new BadRequestException("Table is inactive");
        }
        return table;
    }

    public TableResponse toResponse(RestaurantTable table) {
        String qrUrl = frontendOrigin + "/menu?table=" + table.getTableNumber();
        return new TableResponse(table.getId(), table.getTableNumber(), table.isActive(), qrUrl, table.getCreatedAt());
    }
}