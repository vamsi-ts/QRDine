package com.restaurant.service;

import com.restaurant.dto.MenuItemRequest;
import com.restaurant.dto.MenuItemResponse;
import com.restaurant.entity.Category;
import com.restaurant.entity.MenuItem;
import com.restaurant.exception.ResourceNotFoundException;
import com.restaurant.repository.MenuItemRepository;
import com.restaurant.repository.OrderItemRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MenuItemService {
    private final MenuItemRepository menuItemRepository;
    private final OrderItemRepository orderItemRepository;
    private final CategoryService categoryService;

    public List<MenuItemResponse> getAll(Long categoryId) {
        List<MenuItem> items = categoryId == null ? menuItemRepository.findAll() : menuItemRepository.findByCategoryId(categoryId);
        return items.stream().map(this::toResponse).toList();
    }

    public MenuItemResponse getById(Long id) {
        return toResponse(find(id));
    }

    public MenuItemResponse create(MenuItemRequest request) {
        MenuItem item = new MenuItem();
        apply(item, request);
        return toResponse(menuItemRepository.save(item));
    }

    public MenuItemResponse update(Long id, MenuItemRequest request) {
        MenuItem item = find(id);
        apply(item, request);
        return toResponse(menuItemRepository.save(item));
    }

    public void delete(Long id) {
        if (orderItemRepository.existsByMenuItemId(id)) {
            throw new com.restaurant.exception.BadRequestException("Cannot delete a menu item that is already used in orders. Mark it unavailable instead.");
        }
        menuItemRepository.delete(find(id));
    }

    MenuItem find(Long id) {
        return menuItemRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Menu item not found"));
    }

    public MenuItemResponse toResponse(MenuItem item) {
        return new MenuItemResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.getImageUrl(),
                categoryService.toResponse(item.getCategory()),
                item.isAvailable(),
                item.getCreatedAt()
        );
    }

    private void apply(MenuItem item, MenuItemRequest request) {
        Category category = categoryService.find(request.categoryId());
        item.setName(request.name());
        item.setDescription(request.description());
        item.setPrice(request.price());
        item.setImageUrl(request.imageUrl());
        item.setCategory(category);
        item.setAvailable(request.available());
    }
}