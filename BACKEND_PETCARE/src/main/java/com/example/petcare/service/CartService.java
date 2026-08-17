package com.example.petcare.service;

import com.example.petcare.entity.*;
import com.example.petcare.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final ProductRepository productRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final UserRepository userRepository;

    public CartService(
            CartRepository cartRepository,
            ProductRepository productRepository,
            OwnerProfileRepository ownerProfileRepository,
            UserRepository userRepository
    ) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.ownerProfileRepository = ownerProfileRepository;
        this.userRepository = userRepository;
    }

    private Long getOwnerId(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        OwnerProfile owner = ownerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Owner profile not found"));

        return owner.getId();
    }

    // ADD TO CART
    public void addToCart(Long productId, int qty, String email) {

        Long ownerId = getOwnerId(email);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (!product.isActive()) {
            throw new RuntimeException("Product not available");
        }

        CartItem item = cartRepository
                .findByOwnerIdAndProductId(ownerId, productId)
                .orElse(new CartItem());

        item.setOwnerId(ownerId);
        item.setProductId(productId);
        item.setProductName(product.getName());
        item.setPrice(product.getPrice());
        item.setQuantity(item.getQuantity() + qty);

        cartRepository.save(item);
    }

    // VIEW CART
    public List<CartItem> getMyCart(String email) {
        Long ownerId = getOwnerId(email);
        return cartRepository.findByOwnerId(ownerId);
    }

    // UPDATE QTY
    public void updateQuantity(Long cartItemId, int qty, String email) {

        Long ownerId = getOwnerId(email);

        CartItem item = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized");
        }

        item.setQuantity(qty);
        cartRepository.save(item);
    }

    // REMOVE
    public void removeItem(Long id, String email) {

        Long ownerId = getOwnerId(email);

        CartItem item = cartRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));

        if (!item.getOwnerId().equals(ownerId)) {
            throw new RuntimeException("Unauthorized");
        }

        cartRepository.delete(item);
    }
}
