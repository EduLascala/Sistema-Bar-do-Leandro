package com.example.barmgtsystem.controller;

import com.example.barmgtsystem.model.Sale;
import com.example.barmgtsystem.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/sales")
    public List<Sale> getAllSales() {
        return reportService.getAllSales();
    }

    @GetMapping("/sales/by-date")
    public List<Sale> getSalesByDate(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return reportService.getSalesByDate(date);
    }

    @DeleteMapping("/sales/{saleId}")
    public ResponseEntity<Void> cancelSale(@PathVariable String saleId) {
        try {
            reportService.cancelSale(saleId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}