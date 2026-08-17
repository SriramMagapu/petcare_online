package com.example.petcare.service;

import com.example.petcare.dto.CheckoutRequest;
import com.example.petcare.dto.OrderItemDTO;
import com.example.petcare.dto.OrderResponseDTO;
import com.example.petcare.entity.Order;
import com.example.petcare.entity.OrderItem;
import com.example.petcare.entity.OwnerProfile;
import com.example.petcare.entity.Product;
import com.example.petcare.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.util.List;

@Service
public class OrderService {

    /* ===================== DEPENDENCIES ===================== */

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final OwnerProfileRepository ownerProfileRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public OrderService(
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            ProductRepository productRepository,
            OwnerProfileRepository ownerProfileRepository,
            UserRepository userRepository,
            EmailService emailService
    ) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.ownerProfileRepository = ownerProfileRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    /* ===================== OWNER FETCH ===================== */

    // Fetch OwnerProfile using logged-in user's email
    private OwnerProfile getOwnerByEmail(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ownerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Owner profile not found"));
    }

    /* ===================== COD ORDER ===================== */

    // Create Cash-On-Delivery order
    @Transactional
    public Order createCodOrder(String email, String address, List<CheckoutRequest.CheckoutItem> items) {

        OwnerProfile owner = getOwnerByEmail(email);

        // Create base order
        Order order = new Order();
        order.setOwnerId(owner.getId());
        order.setDeliveryAddress(address);
        order.setPaymentMethod("COD");
        order.setPaymentStatus("PAY ON DELIVERY");
        order.setOrderStatus("CREATED");

        // Save first to generate Order ID
        orderRepository.save(order);

        // Build order items and calculate total
        double total = buildOrderItems(order, items);
        order.setTotalAmount(total);
        orderRepository.save(order);

        // 📧 Send styled HTML order confirmation email
        emailService.sendHtmlEmail(
                owner.getEmail(),
                "📦 Order Placed - Cash on Delivery",
                buildOrderEmailHtml(
                        order.getId(),
                        total,
                        "Cash on Delivery",
                        "PAY ON DELIVERY"
                )
        );

        return order;
    }

    /* ===================== ONLINE ORDER ===================== */

    // Create Online Paid order
    @Transactional
    public Order createOnlineOrder(String email, String address, List<CheckoutRequest.CheckoutItem> items) {

        OwnerProfile owner = getOwnerByEmail(email);

        Order order = new Order();
        order.setOwnerId(owner.getId());
        order.setDeliveryAddress(address);
        order.setPaymentMethod("ONLINE");
        order.setPaymentStatus("PAID");
        order.setOrderStatus("CREATED");

        // Save first to generate Order ID
        orderRepository.save(order);

        double total = buildOrderItems(order, items);
        order.setTotalAmount(total);
        orderRepository.save(order);

        // 📧 Send styled HTML payment success email
        emailService.sendHtmlEmail(
                owner.getEmail(),
                "✅ Order Confirmed - Payment Successful",
                buildOrderEmailHtml(
                        order.getId(),
                        total,
                        "Online Payment",
                        "PAID"
                )
        );

        return order;
    }

    /* ===================== ORDER ITEMS ===================== */

    // Build order items, update stock, and calculate total amount
    private double buildOrderItems(Order order, List<CheckoutRequest.CheckoutItem> items) {

        double total = 0;

        for (var ci : items) {

            Product product = productRepository.findById(ci.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            // Validate product availability
            if (!product.isActive())
                throw new RuntimeException("Inactive product");

            if (product.getQuantity() < ci.getQuantity())
                throw new RuntimeException("Insufficient stock");

            // Reduce stock quantity
            product.setQuantity(product.getQuantity() - ci.getQuantity());
            productRepository.save(product);

            // Create order item
            OrderItem item = new OrderItem();
            item.setOrderId(order.getId());
            item.setProductId(product.getId());
            item.setProductName(product.getName());
            item.setQuantity(ci.getQuantity());
            item.setPrice(product.getPrice());

            orderItemRepository.save(item);

            total += product.getPrice() * ci.getQuantity();
        }

        return total;
    }

    /* ===================== FETCH ORDERS ===================== */

    public List<OrderResponseDTO> getOrdersByOwnerEmail(String email) {
        OwnerProfile owner = getOwnerByEmail(email);
        return orderRepository.findByOwnerId(owner.getId())
                .stream()
                .map(this::toDTO)
                .toList();
    }

    /* ===================== DTO MAPPING ===================== */

    public OrderResponseDTO toDTO(Order order) {

        var items = orderItemRepository.findByOrderId(order.getId())
                .stream()
                .map(oi -> {

                    Product product = productRepository.findById(oi.getProductId())
                            .orElse(null);

                    String imageUrl = null;
                    if (product != null && product.getImagePath() != null) {
                        String path = product.getImagePath();
                        if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/uploads/")) {
                            imageUrl = path;
                        } else {
                            imageUrl = "/uploads/" + path;
                        }
                    }

                    return new OrderItemDTO(
                            oi.getProductName(),
                            oi.getQuantity(),
                            oi.getPrice(),
                            imageUrl
                    );
                })
                .toList();

        return new OrderResponseDTO(
                order.getId(),
                order.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDateTime(),
                order.getOrderStatus(),
                order.getPaymentStatus(),
                order.getPaymentMethod(),
                order.getTotalAmount(),
                items
        );
    }

    /* ===================== EMAIL TEMPLATE ===================== */

    // HTML email template for order confirmation
    private String buildOrderEmailHtml(
            Long orderId,
            double total,
            String paymentMethod,
            String paymentStatus
    ) {
        return """
<!DOCTYPE html>
<html>
<body style="margin:0; padding:0; background:#f4f6f8; font-family:Arial, sans-serif;">
<table width="100%%" cellpadding="0" cellspacing="0">
<tr>
<td align="center" style="padding:30px;">

<table width="600" style="background:#ffffff; border-radius:10px;
box-shadow:0 6px 20px rgba(0,0,0,0.08); overflow:hidden;">

<tr>
<td style="background:#2196f3; padding:20px; text-align:center;
color:#ffffff; font-size:22px; font-weight:bold;">
🐾 Smart Pet Care
</td>
</tr>

<tr>
<td style="padding:30px; color:#333;">
<h2 style="margin-top:0;">Order Confirmation</h2>

<p>Your order has been successfully placed.</p>

<table width="100%%" cellpadding="8" cellspacing="0"
style="background:#f8fafc; border-radius:8px; margin:20px 0;">
<tr>
<td><b>Order ID</b></td>
<td>#%d</td>
</tr>
<tr>
<td><b>Payment Method</b></td>
<td>%s</td>
</tr>
<tr>
<td><b>Payment Status</b></td>
<td>%s</td>
</tr>
<tr>
<td><b>Total Amount</b></td>
<td>₹%.2f</td>
</tr>
</table>

<p>
📦 You will receive another email once your order is shipped.
</p>

<p>
Thank you for shopping with <b>Smart Pet Care</b> 💙
</p>
</td>
</tr>

<tr>
<td style="background:#f1f5f9; text-align:center;
padding:15px; font-size:12px; color:#777;">
© 2026 Smart Pet Care
</td>
</tr>

</table>

</td>
</tr>
</table>
</body>
</html>
"""
.formatted(orderId, paymentMethod, paymentStatus, total);
    }
}
