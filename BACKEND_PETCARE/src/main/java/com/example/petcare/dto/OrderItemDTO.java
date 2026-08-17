package com.example.petcare.dto;

public class OrderItemDTO {

    private String productName;
    private Integer quantity;
    private Double price;
    private String imageUrl;

    public OrderItemDTO(
            String productName,
            Integer quantity,
            Double price,
            String imageUrl
    ) {
        this.productName = productName;
        this.quantity = quantity;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    // getters
    public String getProductName() { return productName; }
    public Integer getQuantity() { return quantity; }
    public Double getPrice() { return price; }
    public String getImageUrl() { return imageUrl; }
}
