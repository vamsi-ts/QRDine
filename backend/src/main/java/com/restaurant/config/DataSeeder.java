package com.restaurant.config;

import com.restaurant.entity.Category;
import com.restaurant.entity.MenuItem;
import com.restaurant.entity.RestaurantTable;
import com.restaurant.entity.User;
import com.restaurant.enums.Role;
import com.restaurant.repository.CategoryRepository;
import com.restaurant.repository.MenuItemRepository;
import com.restaurant.repository.RestaurantTableRepository;
import com.restaurant.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepository;
    private final RestaurantTableRepository tableRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;");
            jdbcTemplate.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_payment_method_check;");
        } catch (Exception e) {
            // Ignore if constraints don't exist
        }
        seedUser("Admin", "admin@restaurant.com", "admin123", Role.ADMIN);
        seedUser("Waiter", "waiter@restaurant.com", "waiter123", Role.WAITER);
        seedUser("Kitchen", "kitchen@restaurant.com", "kitchen123", Role.KITCHEN);
        for (int number = 1; number <= 5; number++) {
            if (!tableRepository.existsByTableNumber(number)) {
                RestaurantTable table = new RestaurantTable();
                table.setTableNumber(number);
                table.setActive(true);
                tableRepository.save(table);
            }
        }
        if (categoryRepository.count() == 0) {
            List<Category> categories = List.of(
                    category("Starters", "Small plates and crisp bites"),
                    category("Main Course", "Restaurant favorites for a full meal"),
                    category("Biryani", "Layered rice dishes with fragrant spices"),
                    category("Drinks", "Refreshing cold beverages"),
                    category("Desserts", "Sweet finishes")
            );
            categoryRepository.saveAll(categories);
        }
        if (menuItemRepository.count() == 0) {
            List<Category> categories = categoryRepository.findAll();
            Category starters = categories.stream().filter(c -> c.getName().equals("Starters")).findFirst().orElseThrow();
            Category mains = categories.stream().filter(c -> c.getName().equals("Main Course")).findFirst().orElseThrow();
            Category biryani = categories.stream().filter(c -> c.getName().equals("Biryani")).findFirst().orElseThrow();
            Category drinks = categories.stream().filter(c -> c.getName().equals("Drinks")).findFirst().orElseThrow();
            Category desserts = categories.stream().filter(c -> c.getName().equals("Desserts")).findFirst().orElseThrow();
            menuItemRepository.saveAll(List.of(
                    item("Paneer Tikka", "Char-grilled paneer with peppers", "229", starters),
                    item("Veg Spring Rolls", "Crisp rolls with sweet chili dip", "179", starters),
                    item("Chicken 65", "Spicy fried chicken bites", "249", starters),
                    item("Butter Chicken", "Creamy tomato chicken curry", "349", mains),
                    item("Paneer Butter Masala", "Paneer in rich makhani gravy", "299", mains),
                    item("Dal Tadka", "Yellow lentils tempered with ghee", "199", mains),
                    item("Chicken Dum Biryani", "Slow-cooked chicken biryani", "329", biryani),
                    item("Veg Biryani", "Spiced rice with seasonal vegetables", "249", biryani),
                    item("Mutton Biryani", "Aromatic mutton biryani", "399", biryani),
                    item("Fresh Lime Soda", "Sweet, salted, or mixed", "89", drinks),
                    item("Mango Lassi", "Thick yogurt mango cooler", "129", drinks),
                    item("Masala Chai", "Classic spiced tea", "59", drinks),
                    item("Gulab Jamun", "Warm syrup-soaked dumplings", "99", desserts),
                    item("Brownie Sundae", "Chocolate brownie with ice cream", "169", desserts),
                    item("Kulfi", "Traditional frozen dairy dessert", "119", desserts)
            ));
        }
    }

    private void seedUser(String name, String email, String password, Role role) {
        if (userRepository.existsByEmail(email)) {
            return;
        }
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setActive(true);
        userRepository.save(user);
    }

    private Category category(String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        return category;
    }

    private MenuItem item(String name, String description, String price, Category category) {
        MenuItem item = new MenuItem();
        item.setName(name);
        item.setDescription(description);
        item.setPrice(new BigDecimal(price));
        item.setImageUrl("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80");
        item.setCategory(category);
        item.setAvailable(true);
        return item;
    }
}