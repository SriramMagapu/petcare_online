package com.example.petcare.dto;

import java.util.List;

public class OnlinePaymentDTO {

    private String razorpayOrderId;
    private String razorpayPaymentId;
    private String razorpaySignature;

    private String address;
    private List<CheckoutRequest.CheckoutItem> items;

    public String getRazorpayOrderId() { return razorpayOrderId; }
    public void setRazorpayOrderId(String razorpayOrderId) { this.razorpayOrderId = razorpayOrderId; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getRazorpaySignature() { return razorpaySignature; }
    public void setRazorpaySignature(String razorpaySignature) { this.razorpaySignature = razorpaySignature; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public List<CheckoutRequest.CheckoutItem> getItems() { return items; }
    public void setItems(List<CheckoutRequest.CheckoutItem> items) { this.items = items; }
}
