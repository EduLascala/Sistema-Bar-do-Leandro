package com.example.barmgtsystem.service;

import com.example.barmgtsystem.model.User; // Importa a classe User do pacote model
import com.example.barmgtsystem.repository.UserRepository; // Importa a interface UserRepository do pacote repository
import org.springframework.beans.factory.annotation.Autowired; // Importa a anotação para injeção de dependências
import org.springframework.stereotype.Service; // Importa a anotação para definir esta classe como um serviço Spring

import java.util.Optional; // Importa a classe Optional para lidar com valores que podem estar ausentes

@Service // Indica que esta classe é um componente de serviço Spring
public class AuthService {

    @Autowired // Injeta uma instância de UserRepository fornecida pelo Spring
    private UserRepository userRepository;

    // Método para autenticar um usuário
    public Optional<User> authenticate(String username, String password) {
        // Busca um usuário pelo nome de usuário e filtra pela senha
        return userRepository.findByUsername(username)
                .filter(user -> user.getPassword().equals(password));
    }

    // Método para registrar um novo usuário
    public User register(User user) {
        // Salva o novo usuário no banco de dados
        return userRepository.save(user);
    }

    // Método para encontrar um usuário pelo nome de usuário
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
}