package com.example.barmgtsystem;

import com.example.barmgtsystem.service.TableService; // Import TableService
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootApplication
public class BarManagementBackendApplication {

	@Autowired
	private TableService tableService; // Injeta o TableService

	public static void main(String[] args) {
		SpringApplication.run(BarManagementBackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner run() {
		return args -> {
			tableService.initializeTables(20);
			tableService.startTableStatusMonitoring();
			System.out.println("Backend application started successfully!");
		};
	}
}