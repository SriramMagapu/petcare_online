package com.example.petcare.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.example.petcare.service.AdminOrderService;
import com.example.petcare.dto.AdminOrderDTO;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final AdminOrderService adminOrderService;

    public AdminOrderController(AdminOrderService adminOrderService) {
        this.adminOrderService = adminOrderService;
    }

    @GetMapping
    public List<AdminOrderDTO> getAllOrders() {
        return adminOrderService.getAllOrders();
    }

    @PutMapping("/{orderId}/status")
    public void updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody UpdateStatusRequest request
    ) {
        adminOrderService.updateOrderStatus(orderId, request.getOrderStatus());
    }

    // === Request DTO ===
    public static class UpdateStatusRequest {
        private String orderStatus; // "CREATED", "SHIPPED", "DELIVERED"

        public String getOrderStatus() { return orderStatus; }
        public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }
    }
}
