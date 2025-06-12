package com.example.barmgtsystem.controller;

import com.example.barmgtsystem.model.RestaurantTable; // Atualizado
import com.example.barmgtsystem.service.TableService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/tables")
public class TableController {

    @Autowired
    private TableService tableService;

    @GetMapping
    public List<RestaurantTable> getAllTables() { // Atualizado
        return tableService.getAllTables();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTable> getTableById(@PathVariable Long id) { // Atualizado
        Optional<RestaurantTable> table = tableService.getTableById(id); // Atualizado
        return table.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/init-monitoring")
    public ResponseEntity<String> initTableMonitoring() {
        tableService.startTableStatusMonitoring();
        return ResponseEntity.ok("Table status monitoring started.");
    }
}