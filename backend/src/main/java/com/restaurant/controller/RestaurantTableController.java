package com.restaurant.controller;

import com.restaurant.dto.TableRequest;
import com.restaurant.dto.TableResponse;
import com.restaurant.service.RestaurantTableService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RestaurantTableController {
    private final RestaurantTableService tableService;

    @GetMapping
    public List<TableResponse> getAll() {
        return tableService.getAll();
    }

    @GetMapping("/{id}")
    public TableResponse getById(@PathVariable Long id) {
        return tableService.getById(id);
    }

    @PostMapping
    public TableResponse create(@Valid @RequestBody TableRequest request) {
        return tableService.create(request);
    }

    @PutMapping("/{id}")
    public TableResponse update(@PathVariable Long id, @Valid @RequestBody TableRequest request) {
        return tableService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        tableService.delete(id);
    }
}