package com.example.barmgtsystem.repository;

import com.example.barmgtsystem.model.RestaurantTable; // Importar a classe renomeada
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RestaurantTableRepository extends JpaRepository<RestaurantTable, Long> { // Usar RestaurantTable
    Optional<RestaurantTable> findById(Long id);
}