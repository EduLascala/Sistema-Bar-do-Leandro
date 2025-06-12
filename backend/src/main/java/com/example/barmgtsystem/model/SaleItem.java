package com.example.barmgtsystem.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sale_items")
public class SaleItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id")
    private String productId;
    @Column(name = "product_name", nullable = false)
    private String productName;
    @Column(name = "price_at_sale", nullable = false)
    private double priceAtSale;
    @Column(nullable = false)
    private int quantity;
    @Column(name = "send_to_kitchen", nullable = false)
    private boolean sendToKitchen;

    // Construtor padrão
    public SaleItem() {
    }

    // Construtor com todos os argumentos
    public SaleItem(Long id, String productId, String productName, double priceAtSale, int quantity, boolean sendToKitchen) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.priceAtSale = priceAtSale;
        this.quantity = quantity;
        this.sendToKitchen = sendToKitchen;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public double getPriceAtSale() {
        return priceAtSale;
    }

    public int getQuantity() {
        return quantity;
    }

    public boolean isSendToKitchen() {
        return sendToKitchen;
    }

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public void setPriceAtSale(double priceAtSale) {
        this.priceAtSale = priceAtSale;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public void setSendToKitchen(boolean sendToKitchen) {
        this.sendToKitchen = sendToKitchen;
    }
}