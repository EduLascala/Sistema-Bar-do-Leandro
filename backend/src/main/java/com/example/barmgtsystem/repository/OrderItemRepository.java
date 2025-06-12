package com.example.barmgtsystem.repository;

import com.example.barmgtsystem.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // Importar List

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    // Adicionar este método para buscar OrderItems por Product ID
    List<OrderItem> findByProductId(String productId);
}