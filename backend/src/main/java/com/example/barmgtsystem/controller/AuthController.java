package com.example.barmgtsystem.controller;

import com.example.barmgtsystem.model.User; // Importa a classe User
import com.example.barmgtsystem.service.AuthService; // Importa o serviço AuthService
import org.springframework.beans.factory.annotation.Autowired; // Anotação para injeção de dependências
import org.springframework.http.HttpStatus; // Para códigos de status HTTP
import org.springframework.http.ResponseEntity; // Para construir respostas HTTP
import org.springframework.web.bind.annotation.*; // Anotações para mapeamento de requisições web

import java.util.Map; // Para lidar com dados de requisição como Map
import java.util.Optional; // Para lidar com valores que podem estar ausentes

@RestController // Indica que esta classe é um controlador REST
@RequestMapping("/api/auth") // Define o caminho base para os endpoints deste controlador
public class AuthController {

    @Autowired // Injeta o AuthService
    private AuthService authService;

    @PostMapping("/login") // Mapeia requisições POST para /api/auth/login
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) { // Recebe as credenciais no corpo da requisição
        String username = credentials.get("username");
        String password = credentials.get("password");

        Optional<User> user = authService.authenticate(username, password);

        if (user.isPresent()) {
            // Em uma aplicação real, aqui você geraria um token JWT para o frontend
            // Por simplicidade, vamos retornar um objeto User (sem a senha)
            User loggedInUser = user.get();
            loggedInUser.setPassword(null); // Nunca retorne a senha!
            return ResponseEntity.ok(loggedInUser); // Retorna 200 OK com o usuário logado
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials"); // Retorna 401 Unauthorized
        }
    }

    @PostMapping("/register") // Mapeia requisições POST para /api/auth/register
    public ResponseEntity<?> register(@RequestBody User user) { // Recebe o objeto User no corpo da requisição
        // Validação básica: verificar se o username já existe
        if (authService.findByUsername(user.getUsername()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username already exists"); // Retorna 409 Conflict
        }
        User newUser = authService.register(user);
        newUser.setPassword(null); // Não retornar a senha por segurança
        return ResponseEntity.status(HttpStatus.CREATED).body(newUser); // Retorna 201 Created
    }
}