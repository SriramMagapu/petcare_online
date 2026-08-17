package com.example.petcare.dto;

public class AdminOrderDTO {

    private Long id;
    private String ownerEmail;
    private Double totalAmount;

    private String paymentMethod;  // COD / ONLINE
    private String paymentStatus;  // PENDING / PAID
    private String orderStatus;    // CREATED / SHIPPED / DELIVERED

    private String createdAt;
    private int items; // <= now matches repository "int"

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOwnerEmail() { return ownerEmail; }
    public void setOwnerEmail(String ownerEmail) { this.ownerEmail = ownerEmail; }

    public Double getTotalAmount() { return totalAmount; }
    public void setTotalAmount(Double totalAmount) { this.totalAmount = totalAmount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getOrderStatus() { return orderStatus; }
    public void setOrderStatus(String orderStatus) { this.orderStatus = orderStatus; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public int getItems() { return items; }
    public void setItems(int items) { this.items = items; }
}
