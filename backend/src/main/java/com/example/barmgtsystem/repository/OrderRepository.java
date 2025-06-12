package com.example.barmgtsystem.repository;

import com.example.barmgtsystem.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String> {
    Optional<Order> findById(String id); // JpaRepository já oferece findById, mas é bom ter aqui para clareza
}