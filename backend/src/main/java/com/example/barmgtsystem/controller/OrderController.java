package com.example.barmgtsystem.controller;

import com.example.barmgtsystem.model.Order;
import com.example.barmgtsystem.model.OrderItem;
import com.example.barmgtsystem.enums.PaymentMethod; // Importar o enum PaymentMethod
import com.example.barmgtsystem.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/start/{tableId}")
    public ResponseEntity<Order> startOrder(@PathVariable Long tableId) {
        try {
            Order order = orderService.startOrder(tableId);
            return ResponseEntity.status(HttpStatus.CREATED).body(order);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Ou um DTO de erro
        }
    }

    @PostMapping("/{orderId}/add-item")
    public ResponseEntity<Order> addItemToOrder(@PathVariable String orderId,
                                                @RequestBody Map<String, Object> itemDetails) {
        String productId = (String) itemDetails.get("productId");
        Integer quantity = (Integer) itemDetails.get("quantity");

        if (productId == null || quantity == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Order updatedOrder = orderService.addItemToOrder(orderId, productId, quantity);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // Ou um DTO de erro
        }
    }

    @DeleteMapping("/{orderId}/remove-item/{orderItemId}")
    public ResponseEntity<Order> removeItemFromOrder(@PathVariable String orderId,
                                                     @PathVariable Long orderItemId) {
        try {
            Order updatedOrder = orderService.removeItemFromOrder(orderId, orderItemId);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // Ou um DTO de erro
        }
    }

    @PutMapping("/{orderId}/update-item-quantity/{orderItemId}")
    public ResponseEntity<Order> updateOrderItemQuantity(@PathVariable String orderId,
                                                         @PathVariable Long orderItemId,
                                                         @RequestBody Map<String, Integer> quantityDetails) {
        Integer newQuantity = quantityDetails.get("newQuantity");
        if (newQuantity == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            Order updatedOrder = orderService.updateOrderItemQuantity(orderId, orderItemId, newQuantity);
            return ResponseEntity.ok(updatedOrder);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null); // Ou um DTO de erro
        }
    }

    @PostMapping("/{orderId}/close")
    public ResponseEntity<Order> closeOrder(@PathVariable String orderId,
                                            @RequestBody Map<String, String> paymentDetails) {
        String paymentMethodString = paymentDetails.get("paymentMethod");
        PaymentMethod paymentMethod;
        try {
            paymentMethod = PaymentMethod.valueOf(paymentMethodString.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null); // Método de pagamento inválido
        }

        try {
            orderService.closeOrder(orderId, paymentMethod);
            return ResponseEntity.ok().build(); // Retorna 200 OK sem corpo
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Ou um DTO de erro
        }
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable String orderId) {
        try {
            orderService.cancelOrder(orderId);
            return ResponseEntity.ok().build(); // Retorna 200 OK sem corpo
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null); // Ou um DTO de erro
        }
    }

    @GetMapping("/{tableId}/active")
    public ResponseEntity<Order> getActiveOrderByTableId(@PathVariable Long tableId) {
        Optional<Order> order = orderService.getOrderByTableId(tableId);
        return order.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}