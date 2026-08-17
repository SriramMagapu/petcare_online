package com.example.petcare.dto;

import java.time.LocalDateTime;
import java.util.List;

public class OrderResponseDTO {

    private Long id;
    private LocalDateTime orderDate;
    private String orderStatus;     // new
    private String paymentStatus;   // new
    private String paymentMethod;   // new
    private Double totalAmount;
    private List<OrderItemDTO> items;

    public OrderResponseDTO(
            Long id,
            LocalDateTime orderDate,
            String orderStatus,
            String paymentStatus,
            String paymentMethod,
            Double totalAmount,
            List<OrderItemDTO> items
    ) {
        this.id = id;
        this.orderDate = orderDate;
        this.orderStatus = orderStatus;
        this.paymentStatus = paymentStatus;
        this.paymentMethod = paymentMethod;
        this.totalAmount = totalAmount;
        this.items = items;
    }

    public Long getId() { return id; }
    public LocalDateTime getOrderDate() { return orderDate; }
    public String getOrderStatus() { return orderStatus; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getPaymentMethod() { return paymentMethod; }
    public Double getTotalAmount() { return totalAmount; }
    public List<OrderItemDTO> getItems() { return items; }
}
