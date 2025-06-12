package com.example.barmgtsystem.model;

import jakarta.persistence.*;
import com.example.barmgtsystem.enums.TableStatus;

import java.time.LocalDateTime;

@Entity
@Table(name = "tables")
public class RestaurantTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TableStatus status;
    @Column(name = "order_id")
    private String orderId;
    @Column(name = "start_time")
    private LocalDateTime startTime;

    // Construtor padrão
    public RestaurantTable() {
    }

    // Construtor com todos os argumentos
    public RestaurantTable(Long id, TableStatus status, String orderId, LocalDateTime startTime) {
        this.id = id;
        this.status = status;
        this.orderId = orderId;
        this.startTime = startTime;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public TableStatus getStatus() {
        return status;
    }

    public String getOrderId() {
        return orderId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setStatus(TableStatus status) {
        this.status = status;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }
}