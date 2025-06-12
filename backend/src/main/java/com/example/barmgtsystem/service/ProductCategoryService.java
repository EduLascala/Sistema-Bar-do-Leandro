package com.example.barmgtsystem.service;

import com.example.barmgtsystem.model.ProductCategory; // Importa a classe ProductCategory
import com.example.barmgtsystem.repository.ProductCategoryRepository; // Importa a interface ProductCategoryRepository
import org.springframework.beans.factory.annotation.Autowired; // Anotação para injeção de dependências
import org.springframework.stereotype.Service; // Anotação para definir esta classe como um serviço

import java.util.List;
import java.util.Optional;

@Service
public class ProductCategoryService {

    @Autowired
    private ProductCategoryRepository categoryRepository;

    public List<ProductCategory> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<ProductCategory> getCategoryById(String id) {
        return categoryRepository.findById(id);
    }

    public ProductCategory createCategory(ProductCategory category) {
        // Adicionar lógica de validação, se necessário (ex: nome já existe)
        return categoryRepository.save(category);
    }

    public ProductCategory updateCategory(String id, ProductCategory updatedCategory) {
        return categoryRepository.findById(id)
                .map(category -> {
                    category.setName(updatedCategory.getName());
                    return categoryRepository.save(category);
                })
                .orElseThrow(() -> new RuntimeException("Category not found with id " + id));
    }

    public void deleteCategory(String id) {
        // TODO: Adicionar validação se há produtos usando esta categoria antes de deletar
        categoryRepository.deleteById(id);
    }

    public Optional<ProductCategory> getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }
}