package com.example.petcare.repository;

import com.example.petcare.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByOwnerId(Long ownerId);

    Optional<CartItem> findByOwnerIdAndProductId(Long ownerId, Long productId);
}
