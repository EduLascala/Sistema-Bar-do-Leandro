package com.example.barmgtsystem.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Importar JsonIgnoreProperties

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference
    private Order order;

    @ManyToOne(fetch = FetchType.EAGER) // Adicionar fetch = FetchType.EAGER ou JsonIgnoreProperties
    @JoinColumn(name = "product_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "category"}) // Adicionar esta anotação para evitar loop e problemas de serialização da categoria do produto
    private Product product;

    @Column(nullable = false)
    private int quantity;
    @Column(name = "price_at_order", nullable = false)
    private double priceAtOrder;
    @Column(name = "send_to_kitchen", nullable = false)
    private boolean sendToKitchen;

    // Construtor padrão
    public OrderItem() {
    }

    // Construtor com todos os argumentos
    public OrderItem(Long id, Order order, Product product, int quantity, double priceAtOrder, boolean sendToKitchen) {
        this.id = id;
        this.order = order;
        this.product = product;
        this.quantity = quantity;
        this.priceAtOrder = priceAtOrder;
        this.sendToKitchen = sendToKitchen;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Order getOrder() {
        return order;
    }

    public Product getProduct() {
        return product;
    }

    public int getQuantity() {
        return quantity;
    }

    public double getPriceAtOrder() {
        return priceAtOrder;
    }

    public boolean isSendToKitchen() {
        return sendToKitchen;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void setPriceAtOrder(double priceAtOrder) {
        this.priceAtOrder = priceAtOrder;
    }

    public void setSendToKitchen(boolean sendToKitchen) {
        this.sendToKitchen = sendToKitchen;
    }
}