package com.example.petcare.controller;

import com.example.petcare.entity.CartItem;
import com.example.petcare.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @PostMapping("/add")
    public ResponseEntity<?> add(
            @RequestParam Long productId,
            @RequestParam int quantity,
            @AuthenticationPrincipal String email
    ) {
        cartService.addToCart(productId, quantity, email);
        return ResponseEntity.ok("Added to cart");
    }

    @GetMapping
    public List<CartItem> view(@AuthenticationPrincipal String email) {
        return cartService.getMyCart(email);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateQty(
            @PathVariable Long id,
            @RequestParam int quantity,
            @AuthenticationPrincipal String email
    ) {
        cartService.updateQuantity(id, quantity, email);
        return ResponseEntity.ok("Updated");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> remove(
            @PathVariable Long id,
            @AuthenticationPrincipal String email
    ) {
        cartService.removeItem(id, email);
        return ResponseEntity.ok("Removed");
    }
}
