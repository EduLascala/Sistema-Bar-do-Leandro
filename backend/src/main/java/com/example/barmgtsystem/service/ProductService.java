package com.example.barmgtsystem.service;

import com.example.barmgtsystem.model.Product;
import com.example.barmgtsystem.model.ProductCategory;
import com.example.barmgtsystem.model.OrderItem; // Importar OrderItem
import com.example.barmgtsystem.repository.ProductRepository;
import com.example.barmgtsystem.repository.ProductCategoryRepository;
import com.example.barmgtsystem.repository.OrderItemRepository; // Importar OrderItemRepository
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Importar Transactional

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductCategoryService categoryService;

    @Autowired
    private OrderItemRepository orderItemRepository; // Injetar OrderItemRepository

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Optional<Product> getProductById(String id) {
        return productRepository.findById(id);
    }

    public Product createProduct(Product product) {
        ProductCategory category = product.getCategory();
        if (category.getId() == null) {
            ProductCategory existingCategory = categoryService.getCategoryByName(category.getName())
                    .orElseThrow(() -> new RuntimeException("Category not found: " + category.getName()));
            product.setCategory(existingCategory);
        }
        return productRepository.save(product);
    }

    public Product updateProduct(String id, Product updatedProduct) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(updatedProduct.getName());
                    ProductCategory category = updatedProduct.getCategory();
                    if (category.getId() == null) {
                        ProductCategory existingCategory = categoryService.getCategoryByName(category.getName())
                                .orElseThrow(() -> new RuntimeException("Category not found: " + category.getName()));
                        product.setCategory(existingCategory);
                    } else {
                        product.setCategory(category);
                    }
                    product.setPrice(updatedProduct.getPrice());
                    product.setSendToKitchen(updatedProduct.isSendToKitchen());
                    return productRepository.save(product);
                })
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));
    }

    @Transactional // A anotação @Transactional garante que toda a operação seja atômica
    public void deleteProduct(String id) {
        // Primeiro, verifica se o produto existe
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id " + id));

        // Verifica se há OrderItems associados a este produto
        List<OrderItem> associatedOrderItems = orderItemRepository.findByProductId(id);
        if (!associatedOrderItems.isEmpty()) {
            throw new RuntimeException("Product cannot be deleted as it is associated with existing orders. Please remove it from orders first.");
        }

        // Se não houver associações, pode deletar
        productRepository.deleteById(id);
    }
}