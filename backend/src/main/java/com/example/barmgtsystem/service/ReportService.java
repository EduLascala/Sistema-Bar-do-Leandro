package com.example.barmgtsystem.service;

import com.example.barmgtsystem.model.Sale;
import com.example.barmgtsystem.repository.SaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private SaleRepository saleRepository;

    public List<Sale> getAllSales() {
        return saleRepository.findAll();
    }

    public List<Sale> getSalesByDate(LocalDate date) {
        LocalDateTime startOfDay = date.atStartOfDay();
        LocalDateTime endOfDay = date.atTime(LocalTime.MAX); // Fim do dia (23:59:59.999...)
        return saleRepository.findByTimestampBetween(startOfDay, endOfDay);
    }

    public void cancelSale(String saleId) {
        saleRepository.deleteById(saleId);
    }
}