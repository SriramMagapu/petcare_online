package com.example.petcare.controller;

import com.example.petcare.dto.CheckoutRequest;
import com.example.petcare.dto.OrderResponseDTO;
import com.example.petcare.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("hasRole('OWNER')")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // ---------------------------
    // COD ORDER CREATION (IMMEDIATE)
    // ---------------------------
    @PostMapping("/checkout/cod")
    public ResponseEntity<?> codCheckout(
            @RequestBody CheckoutRequest request,
            Authentication auth
    ) {
        String email = auth.getName();

        var order = orderService.createCodOrder(
                email,
                request.getAddress(),
                request.getItems()
        );

        // convert to DTO for frontend
        return ResponseEntity.ok(orderService.toDTO(order));
    }

    // ---------------------------------------------------
    // ONLINE ORDER FINAL CREATION AFTER PAYMENT VERIFIED
    // this is called by PaymentController AFTER Razorpay
    // ---------------------------------------------------
    @PostMapping("/checkout/online/finalize")
    public ResponseEntity<?> finalizeOnlineOrder(
            @RequestBody CheckoutRequest request,
            Authentication auth
    ) {
        String email = auth.getName();

        var order = orderService.createOnlineOrder(
                email,
                request.getAddress(),
                request.getItems()
        );

        return ResponseEntity.ok(orderService.toDTO(order));
    }

    // ----------------------
    // FETCH ORDERS FOR OWNER
    // ----------------------
    @GetMapping("/my-orders")
    public ResponseEntity<List<OrderResponseDTO>> getMyOrders(Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(orderService.getOrdersByOwnerEmail(email));
    }
}
