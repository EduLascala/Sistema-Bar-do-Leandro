import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext'; // Importar useAuth para verificar o usuário logado
import API_BASE_URL from '../config/api'; // Importa a URL base da API

// Tipos - Mantenha-os compatíveis com suas entidades Java
export interface Product {
  id: string;
  name: string;
  category: { id: string; name: string }; // Categoria agora é um objeto com id e name
  price: number;
  sendToKitchen: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
}

interface ProductContextType {
  products: Product[];
  categories: ProductCategory[];
  addProduct: (product: Omit<Product, 'id' | 'category'> & { category: string }) => Promise<void>; // Categoria como string para input
  updateProduct: (id: string, product: Omit<Product, 'id' | 'category'> & { category: string }) => Promise<void>; // Categoria como string para input
  deleteProduct: (id: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

// Create Context
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Provider Component
export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth(); // Obter o usuário logado
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);

  // Função para buscar produtos do backend
  const fetchProducts = useCallback(async () => {
    if (!currentUser) return; // Não busca se não estiver logado
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      if (response.ok) {
        const data: Product[] = await response.json();
        setProducts(data);
      } else {
        toast.error('Falha ao carregar produtos.');
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro de conexão ao buscar produtos.');
    }
  }, [currentUser]);

  // Função para buscar categorias do backend
  const fetchCategories = useCallback(async () => {
    if (!currentUser) return; // Não busca se não estiver logado
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      if (response.ok) {
        const data: ProductCategory[] = await response.json();
        setCategories(data);
      } else {
        toast.error('Falha ao carregar categorias.');
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro de conexão ao buscar categorias.');
    }
  }, [currentUser]);

  // Carregar produtos e categorias ao montar o componente ou quando o usuário loga
  useEffect(() => {
    if (currentUser) {
      fetchProducts();
      fetchCategories();
    } else {
      setProducts([]); // Limpar produtos se deslogado
      setCategories([]); // Limpar categorias se deslogado
    }
  }, [currentUser, fetchProducts, fetchCategories]);


  // Add a new product
  const addProduct = async (productData: Omit<Product, 'id' | 'category'> & { category: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData), // O backend espera o nome da categoria como string no ProductRequest DTO
      });

      if (response.ok) {
        toast.success(`Produto "${productData.name}" adicionado com sucesso!`);
        fetchProducts(); // Recarrega a lista de produtos
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao adicionar produto: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      toast.error('Erro de conexão ao adicionar produto.');
    }
  };

  // Update an existing product
  const updateProduct = async (id: string, productData: Omit<Product, 'id' | 'category'> & { category: string }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData), // O backend espera o nome da categoria como string no ProductRequest DTO
      });

      if (response.ok) {
        toast.success(`Produto "${productData.name}" atualizado com sucesso!`);
        fetchProducts(); // Recarrega a lista de produtos
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao atualizar produto: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro de conexão ao atualizar produto.');
    }
  };

  // Delete a product
  const deleteProduct = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) { // 204 No Content é sucesso
        toast.success('Produto removido com sucesso!');
        fetchProducts(); // Recarrega a lista de produtos
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao remover produto: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao remover produto:', error);
      toast.error('Erro de conexão ao remover produto.');
    }
  };

  // Add a new category
  const addCategory = async (name: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        toast.success(`Categoria "${name}" adicionada com sucesso!`);
        fetchCategories(); // Recarrega a lista de categorias
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao adicionar categoria: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar categoria:', error);
      toast.error('Erro de conexão ao adicionar categoria.');
    }
  };

  // Delete a category
  const deleteCategory = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) { // 204 No Content é sucesso
        toast.success('Categoria removida com sucesso!');
        fetchCategories(); // Recarrega a lista de categorias
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao remover categoria: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
      toast.error('Erro de conexão ao remover categoria.');
    }
  };

  const value = {
    products,
    categories,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};

// Custom hook to use product context
export const useProduct = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
};