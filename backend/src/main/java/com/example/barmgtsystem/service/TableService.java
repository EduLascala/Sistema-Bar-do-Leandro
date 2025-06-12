package com.example.barmgtsystem.service;

import com.example.barmgtsystem.model.RestaurantTable; // Importa a classe RestaurantTable
import com.example.barmgtsystem.enums.TableStatus; // Importa o enum TableStatus do seu pacote 'enums'
import com.example.barmgtsystem.repository.RestaurantTableRepository; // Importa o repositório correto

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Service
public class TableService {

    @Autowired
    private RestaurantTableRepository tableRepository;

    // Scheduler para verificar o status das mesas (alerta)
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

    // Método para inicializar as mesas, se o banco de dados estiver vazio
    public void initializeTables(int numberOfTables) {
        if (tableRepository.count() == 0) {
            // Cria novas mesas usando o construtor gerado pelo Lombok @AllArgsConstructor
            for (int i = 1; i <= numberOfTables; i++) {
                tableRepository.save(new RestaurantTable(null, TableStatus.FREE, null, null));
            }
        }
    }

    public List<RestaurantTable> getAllTables() {
        return tableRepository.findAll();
    }

    public Optional<RestaurantTable> getTableById(Long id) {
        return tableRepository.findById(id);
    }

    public RestaurantTable updateTableStatus(Long id, TableStatus status, String orderId, LocalDateTime startTime) {
        return tableRepository.findById(id)
                .map(table -> {
                    table.setStatus(status); // Chamada de método gerado pelo Lombok
                    table.setOrderId(orderId); // Chamada de método gerado pelo Lombok
                    table.setStartTime(startTime); // Chamada de método gerado pelo Lombok
                    return tableRepository.save(table);
                })
                .orElseThrow(() -> new RuntimeException("Table not found with id " + id));
    }

    // Método para iniciar a verificação de alerta de mesas
    public void startTableStatusMonitoring() {
        // Monitora a cada minuto
        scheduler.scheduleAtFixedRate(this::checkTableAlerts, 1, 1, TimeUnit.MINUTES);
    }

    private void checkTableAlerts() {
        List<RestaurantTable> tables = tableRepository.findAll();
        for (RestaurantTable table : tables) {
            if (table.getStatus() == TableStatus.OCCUPIED && table.getStartTime() != null) { // Chamada de método gerado pelo Lombok
                long minutesElapsed = java.time.Duration.between(table.getStartTime(), LocalDateTime.now()).toMinutes(); // Chamada de método gerado pelo Lombok
                if (minutesElapsed >= 30) { // Alerta após 30 minutos
                    table.setStatus(TableStatus.ALERT); // Chamada de método gerado pelo Lombok
                    tableRepository.save(table);
                }
            }
        }
    }
}