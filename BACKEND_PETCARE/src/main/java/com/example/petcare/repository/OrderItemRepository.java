package com.example.petcare.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.petcare.entity.OrderItem;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);

    int countByOrderId(Long orderId); // number of items per order
}
