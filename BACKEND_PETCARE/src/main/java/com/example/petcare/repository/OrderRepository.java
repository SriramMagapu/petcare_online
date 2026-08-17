package com.example.petcare.repository;

import com.example.petcare.entity.Order;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OrderRepository extends JpaRepository<Order, Long> {
	
	List<Order> findByOwnerId(Long ownerId);
	
    @Query("SELECT COALESCE(SUM(o.totalAmount),0) FROM Order o WHERE o.orderStatus = 'DELIVERED'")
    double sumDeliveredRevenue();

    @Query("""
        SELECT oi.productName
        FROM OrderItem oi 
        JOIN Order o ON oi.orderId = o.id
        WHERE o.orderStatus = 'DELIVERED'
        GROUP BY oi.productName
        ORDER BY SUM(oi.quantity) DESC
        LIMIT 1
    """)
    String findTopSellingProduct();

    @Query("SELECT COALESCE(AVG(o.totalAmount),0) FROM Order o WHERE o.orderStatus = 'DELIVERED'")
    double averageOrderValue();
}
