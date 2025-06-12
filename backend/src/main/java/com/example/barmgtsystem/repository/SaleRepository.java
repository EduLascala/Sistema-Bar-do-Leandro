package com.example.barmgtsystem.repository;

import com.example.barmgtsystem.model.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SaleRepository extends JpaRepository<Sale, String> {
    List<Sale> findByTimestampBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);
}