package com.example.barmgtsystem.model;

import jakarta.persistence.*;
import com.example.barmgtsystem.enums.OrderStatus;
import com.example.barmgtsystem.enums.PaymentMethod;
import com.fasterxml.jackson.annotation.JsonManagedReference; // Importar

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(name = "table_id", nullable = false)
    private Long tableId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference // Adicionar esta anotação
    private List<OrderItem> items;

    @Column(name = "total_amount", nullable = false)
    private double totalAmount;
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;
    @Column(name = "end_time")
    private LocalDateTime endTime;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    private PaymentMethod paymentMethod;

    // Construtor padrão
    public Order() {
    }

    // Construtor com todos os argumentos
    public Order(String id, Long tableId, List<OrderItem> items, double totalAmount, LocalDateTime startTime, LocalDateTime endTime, OrderStatus status, PaymentMethod paymentMethod) {
        this.id = id;
        this.tableId = tableId;
        this.items = items;
        this.totalAmount = totalAmount;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
        this.paymentMethod = paymentMethod;
    }

    // Getters
    public String getId() {
        return id;
    }

    public Long getTableId() {
        return tableId;
    }

    public List<OrderItem> getItems() {
        return items;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setTableId(Long tableId) {
        this.tableId = tableId;
    }

    public void setItems(List<OrderItem> items) {
        this.items = items;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}