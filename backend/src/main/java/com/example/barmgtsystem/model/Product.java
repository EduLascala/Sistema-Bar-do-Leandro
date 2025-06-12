package com.example.barmgtsystem.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties; // Importar JsonIgnoreProperties

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    @Column(nullable = false)
    private String name;
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private ProductCategory category;
    @Column(nullable = false)
    private double price;
    @Column(name = "send_to_kitchen", nullable = false)
    private boolean sendToKitchen;

    // Construtor padrão
    public Product() {
    }

    // Construtor com todos os argumentos
    public Product(String id, String name, ProductCategory category, double price, boolean sendToKitchen) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.price = price;
        this.sendToKitchen = sendToKitchen;
    }

    // Getters
    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public ProductCategory getCategory() {
        return category;
    }

    public double getPrice() {
        return price;
    }

    public boolean isSendToKitchen() { // Getter para boolean é 'is'
        return sendToKitchen;
    }

    // Setters
    public void setId(String id) {
        this.id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setCategory(ProductCategory category) {
        this.category = category;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public void setSendToKitchen(boolean sendToKitchen) {
        this.sendToKitchen = sendToKitchen;
    }
}