package com.example.petcare.service;

import java.util.List;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import com.example.petcare.dto.AdminOrderDTO;
import com.example.petcare.entity.Order;
import com.example.petcare.entity.OwnerProfile;
import com.example.petcare.repository.OrderItemRepository;
import com.example.petcare.repository.OrderRepository;
import com.example.petcare.repository.OwnerProfileRepository;
import com.example.petcare.repository.UserRepository;

@Service
public class AdminOrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final UserRepository userRepository;

    public AdminOrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            OwnerProfileRepository ownerProfileRepository,
            UserRepository userRepository
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.ownerProfileRepository = ownerProfileRepository;
        this.userRepository = userRepository;
    }

    public List<AdminOrderDTO> getAllOrders() {

        return orderRepository.findAll().stream().map(order -> {

            OwnerProfile owner = ownerProfileRepository
                    .findById(order.getOwnerId())
                    .orElseThrow();

            String email = userRepository
                    .findById(owner.getUserId())
                    .orElseThrow()
                    .getEmail();

            AdminOrderDTO dto = new AdminOrderDTO();
            dto.setId(order.getId());
            dto.setOwnerEmail(email);
            dto.setTotalAmount(order.getTotalAmount());

            dto.setPaymentMethod(order.getPaymentMethod());
            dto.setPaymentStatus(order.getPaymentStatus());
            dto.setOrderStatus(order.getOrderStatus());

            dto.setCreatedAt(order.getCreatedAt().toString());
            dto.setItems(orderItemRepository.countByOrderId(order.getId()));

            return dto;
        }).toList();
    }

    @Transactional
    public void updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setOrderStatus(newStatus);

        if ("COD".equals(order.getPaymentMethod()) &&
            "DELIVERED".equals(newStatus)) {

            order.setPaymentStatus("PAID");
        }

        orderRepository.save(order);
    }

}
