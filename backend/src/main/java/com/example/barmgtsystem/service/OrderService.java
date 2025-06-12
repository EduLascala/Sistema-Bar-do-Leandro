package com.example.barmgtsystem.service;

import com.example.barmgtsystem.model.*; // Importa todas as classes de modelo
import com.example.barmgtsystem.enums.OrderStatus; // Importa o enum OrderStatus do seu pacote 'enums'
import com.example.barmgtsystem.enums.PaymentMethod; // Importa o enum PaymentMethod do seu pacote 'enums'
import com.example.barmgtsystem.enums.TableStatus; // Importa o enum TableStatus do seu pacote 'enums'
import com.example.barmgtsystem.repository.OrderItemRepository;
import com.example.barmgtsystem.repository.OrderRepository;
import com.example.barmgtsystem.repository.ProductRepository;
import com.example.barmgtsystem.repository.SaleRepository;
import com.example.barmgtsystem.repository.SaleItemRepository;
import com.example.barmgtsystem.repository.RestaurantTableRepository; // Importa o repositório correto para a mesa

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private OrderItemRepository orderItemRepository;
    @Autowired
    private RestaurantTableRepository tableRepository; // Injeção do repositório de RestaurantTable
    @Autowired
    private ProductRepository productRepository;
    @Autowired
    private SaleRepository saleRepository;
    @Autowired
    private SaleItemRepository saleItemRepository;

    @Transactional
    public Order startOrder(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found with id " + tableId));

        if (table.getStatus() != TableStatus.FREE) {
            throw new RuntimeException("Table " + tableId + " is not free to start a new order.");
        }

        Order newOrder = new Order();
        newOrder.setTableId(tableId);
        newOrder.setItems(new ArrayList<>());
        newOrder.setTotalAmount(0.0);
        newOrder.setStartTime(LocalDateTime.now());
        newOrder.setStatus(OrderStatus.OPEN);

        Order savedOrder = orderRepository.save(newOrder);

        table.setOrderId(savedOrder.getId());
        table.setStartTime(savedOrder.getStartTime());
        table.setStatus(TableStatus.OCCUPIED);
        tableRepository.save(table);

        return savedOrder;
    }

    @Transactional
    public Order addItemToOrder(String orderId, String productId, int quantity) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + productId));

        Optional<OrderItem> existingOrderItem = order.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingOrderItem.isPresent()) {
            OrderItem item = existingOrderItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            orderItemRepository.save(item);
        } else {
            OrderItem newOrderItem = new OrderItem();
            newOrderItem.setOrder(order);
            newOrderItem.setProduct(product);
            newOrderItem.setQuantity(quantity);
            newOrderItem.setPriceAtOrder(product.getPrice());
            newOrderItem.setSendToKitchen(product.isSendToKitchen());
            order.getItems().add(newOrderItem);
            orderItemRepository.save(newOrderItem);
        }

        updateOrderTotal(order);
        return orderRepository.save(order);
    }

    @Transactional
    public Order removeItemFromOrder(String orderId, Long orderItemId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));
        OrderItem itemToRemove = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("OrderItem not found with id " + orderItemId));

        if (!itemToRemove.getOrder().getId().equals(orderId)) {
            throw new RuntimeException("OrderItem does not belong to this order.");
        }

        order.getItems().remove(itemToRemove);
        orderItemRepository.delete(itemToRemove);

        updateOrderTotal(order);
        return orderRepository.save(order);
    }

    @Transactional
    public Order updateOrderItemQuantity(String orderId, Long orderItemId, int newQuantity) {
        if (newQuantity < 1) {
            return removeItemFromOrder(orderId, orderItemId);
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));
        OrderItem orderItem = orderItemRepository.findById(orderItemId)
                .orElseThrow(() -> new RuntimeException("OrderItem not found with id " + orderItemId));

        if (!orderItem.getOrder().getId().equals(orderId)) {
            throw new RuntimeException("OrderItem does not belong to this order.");
        }

        orderItem.setQuantity(newQuantity);
        orderItemRepository.save(orderItem);

        updateOrderTotal(order);
        return orderRepository.save(order);
    }

    private void updateOrderTotal(Order order) {
        double newTotal = order.getItems().stream()
                .mapToDouble(item -> item.getPriceAtOrder() * item.getQuantity())
                .sum();
        order.setTotalAmount(newTotal);
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    public Optional<Order> getOrderByTableId(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found with id " + tableId));
        if (table.getOrderId() != null) {
            return orderRepository.findById(table.getOrderId());
        }
        return Optional.empty();
    }

    @Transactional
    public Sale closeOrder(String orderId, PaymentMethod paymentMethod) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new RuntimeException("Order " + orderId + " cannot be closed. Current status: " + order.getStatus());
        }
        if (order.getItems().isEmpty()) {
            throw new RuntimeException("Order " + orderId + " has no items. Cannot close empty order.");
        }

        order.setEndTime(LocalDateTime.now());
        order.setStatus(OrderStatus.PAID);
        order.setPaymentMethod(paymentMethod);
        orderRepository.save(order);

        Sale newSale = new Sale();
        newSale.setOrderId(order.getId());
        newSale.setTableId(order.getTableId());
        newSale.setTotalAmount(order.getTotalAmount());
        newSale.setPaymentMethod(paymentMethod);
        newSale.setTimestamp(LocalDateTime.now());

        List<SaleItem> saleItems = new ArrayList<>();
        for (OrderItem orderItem : order.getItems()) {
            SaleItem saleItem = new SaleItem();
            saleItem.setProductId(orderItem.getProduct().getId());
            saleItem.setProductName(orderItem.getProduct().getName());
            saleItem.setPriceAtSale(orderItem.getPriceAtOrder());
            saleItem.setQuantity(orderItem.getQuantity());
            saleItem.setSendToKitchen(orderItem.isSendToKitchen());
            saleItems.add(saleItem);
        }
        newSale.setItems(saleItems);

        Sale savedSale = saleRepository.save(newSale);

        RestaurantTable table = tableRepository.findById(order.getTableId())
                .orElseThrow(() -> new RuntimeException("Table not found for order " + orderId));
        table.setOrderId(null);
        table.setStartTime(null);
        table.setStatus(TableStatus.FREE);
        tableRepository.save(table);

        return savedSale;
    }

    @Transactional
    public Order cancelOrder(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id " + orderId));

        if (order.getStatus() != OrderStatus.OPEN) {
            throw new RuntimeException("Order " + orderId + " cannot be canceled. Current status: " + order.getStatus());
        }

        order.setEndTime(LocalDateTime.now());
        order.setStatus(OrderStatus.CANCELED);
        orderRepository.save(order);

        RestaurantTable table = tableRepository.findById(order.getTableId())
                .orElseThrow(() -> new RuntimeException("Table not found for order " + orderId));
        table.setOrderId(null);
        table.setStartTime(null);
        table.setStatus(TableStatus.FREE);
        tableRepository.save(table);

        return order;
    }
}