package com.example.petcare.controller;

import com.example.petcare.dto.OnlinePaymentDTO;
import com.example.petcare.service.OrderService;
import com.example.petcare.service.RazorpayService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final RazorpayService razorpayService;
    private final OrderService orderService;

    public PaymentController(RazorpayService razorpayService, OrderService orderService) {
        this.razorpayService = razorpayService;
        this.orderService = orderService;
    }

    @PostMapping("/create")
    public Map<String, Object> create(@RequestBody Map<String, Integer> body) throws Exception {
        Integer amount = body.get("amount");

        var rpOrder = razorpayService.createRazorpayOrder(amount);

        return Map.of(
                "razorpayOrderId", rpOrder.get("id"),
                "amount", rpOrder.get("amount"),
                "currency", rpOrder.get("currency")
        );
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody OnlinePaymentDTO body, Authentication auth) throws Exception {

        boolean valid = razorpayService.verifySignature(
                body.getRazorpayOrderId(),
                body.getRazorpayPaymentId(),
                body.getRazorpaySignature()
        );

        if (!valid) {
            return ResponseEntity.badRequest().body("Payment verification failed");
        }

        var email = auth.getName();

        var order = orderService.createOnlineOrder(
                email,
                body.getAddress(),
                body.getItems()
        );

        return ResponseEntity.ok(orderService.toDTO(order));
    }
}
