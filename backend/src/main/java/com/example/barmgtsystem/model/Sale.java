package com.example.barmgtsystem.model;

import jakarta.persistence.*;
import com.example.barmgtsystem.enums.PaymentMethod;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sales")
public class Sale {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(name = "order_id")
    private String orderId;
    @Column(name = "table_id", nullable = false)
    private Long tableId;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "sale_id")
    private List<SaleItem> items; // Importante: agora é List<SaleItem>

    @Column(name = "total_amount", nullable = false)
    private double totalAmount;
    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false)
    private PaymentMethod paymentMethod;
    @Column(nullable = false)
    private LocalDateTime timestamp;

    // Construtor padrão
    public Sale() {
    }

    // Construtor com todos os argumentos
    public Sale(String id, String orderId, Long tableId, List<SaleItem> items, double totalAmount, PaymentMethod paymentMethod, LocalDateTime timestamp) {
        this.id = id;
        this.orderId = orderId;
        this.tableId = tableId;
        this.items = items;
        this.totalAmount = totalAmount;
        this.paymentMethod = paymentMethod;
        this.timestamp = timestamp;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getOrderId() {
        return orderId;
    }

    public Long getTableId() {
        return tableId;
    }

    public List<SaleItem> getItems() {
        return items;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public PaymentMethod getPaymentMethod() {
        return paymentMethod;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public void setTableId(Long tableId) {
        this.tableId = tableId;
    }

    public void setItems(List<SaleItem> items) {
        this.items = items;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public void setPaymentMethod(PaymentMethod paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}