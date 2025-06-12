package com.example.barmgtsystem.controller;

import com.example.barmgtsystem.model.Product; // Importa a classe Product
import com.example.barmgtsystem.model.ProductCategory; // Importa a classe ProductCategory
import com.example.barmgtsystem.service.ProductService; // Importa o serviço ProductService
import com.example.barmgtsystem.service.ProductCategoryService; // Importa o serviço ProductCategoryService (necessário para buscar categoria por nome)
import org.springframework.beans.factory.annotation.Autowired; // Anotação para injeção de dependências
import org.springframework.http.HttpStatus; // Para códigos de status HTTP
import org.springframework.http.ResponseEntity; // Para construir respostas HTTP
import org.springframework.web.bind.annotation.*; // Anotações para mapeamento de requisições web

import java.util.List;
import java.util.Optional;

@RestController // Indica que esta classe é um controlador REST
@RequestMapping("/api/products") // Define o caminho base para os endpoints deste controlador
public class ProductController {

    @Autowired // Injeta o ProductService
    private ProductService productService;
    @Autowired // Injeta o ProductCategoryService para buscar categorias
    private ProductCategoryService categoryService;

    // DTO (Data Transfer Object) para receber dados do produto do frontend.
    // O frontend envia a categoria como uma string, não como um objeto ProductCategory completo.
    static class ProductRequest {
        public String name;
        public String category; // Nome da categoria como String
        public double price;
        public boolean sendToKitchen;
    }

    @GetMapping // Mapeia requisições GET para /api/products
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}") // Mapeia requisições GET para /api/products/{id}
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        Optional<Product> product = productService.getProductById(id);
        return product.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping // Mapeia requisições POST para /api/products
    public ResponseEntity<Product> createProduct(@RequestBody ProductRequest productRequest) { // Recebe ProductRequest
        // Encontra a ProductCategory pelo nome. Se não existir, lança uma exceção.
        ProductCategory category = categoryService.getCategoryByName(productRequest.category)
                .orElseThrow(() -> new RuntimeException("Category not found: " + productRequest.category));

        // Cria a entidade Product a partir do DTO e da ProductCategory encontrada
        Product product = new Product();
        product.setName(productRequest.name);
        product.setCategory(category); // Atribui o objeto ProductCategory
        product.setPrice(productRequest.price);
        product.setSendToKitchen(productRequest.sendToKitchen);

        Product createdProduct = productService.createProduct(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdProduct);
    }

    @PutMapping("/{id}") // Mapeia requisições PUT para /api/products/{id}
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody ProductRequest productRequest) {
        try {
            // Encontra a ProductCategory pelo nome para a atualização
            ProductCategory category = categoryService.getCategoryByName(productRequest.category)
                    .orElseThrow(() -> new RuntimeException("Category not found: " + productRequest.category));

            // Cria uma "nova" entidade Product com os dados atualizados
            // O serviço ProductService irá buscar a entidade existente e aplicar as atualizações
            Product productToUpdate = new Product();
            productToUpdate.setName(productRequest.name);
            productToUpdate.setCategory(category); // Atribui o objeto ProductCategory
            productToUpdate.setPrice(productRequest.price);
            productToUpdate.setSendToKitchen(productRequest.sendToKitchen);

            Product updatedProduct = productService.updateProduct(id, productToUpdate);
            return ResponseEntity.ok(updatedProduct);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // Retorna 404 Not Found se o produto ou categoria não existir
        }
    }

    @DeleteMapping("/{id}") // Mapeia requisições DELETE para /api/products/{id}
    public ResponseEntity<Void> deleteProduct(@PathVariable String id) {
        try {
            // Primeiro, verifica se o produto existe
            Optional<Product> product = productService.getProductById(id);
            if (product.isEmpty()) { // Se o produto não for encontrado
                return ResponseEntity.notFound().build(); // Retorna 404 Not Found
            }

            productService.deleteProduct(id);
            return ResponseEntity.noContent().build(); // Retorna 204 No Content se a deleção for bem-sucedida
        } catch (Exception e) { // Captura qualquer outra exceção inesperada
            // Log do erro e retorno de um status 500 Internal Server Error
            System.err.println("Error deleting product: " + e.getMessage()); // Imprime o erro no console do backend
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}