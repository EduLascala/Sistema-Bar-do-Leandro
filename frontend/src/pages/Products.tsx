import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  // ChevronsUpDown, // Removido, não utilizado
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
// Importa o tipo Product do contexto, ele já reflete a estrutura do backend
import { useProduct, Product, ProductCategory } from '../contexts/ProductContext';

const Products: React.FC = () => {
  const { 
    products, 
    categories, 
    addProduct, 
    updateProduct, 
    deleteProduct,
    addCategory,
    deleteCategory
  } = useProduct();
  
  // State for product form
  // O tipo de productFormData agora usa 'category: string' para corresponder ao input do formulário
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productFormData, setProductFormData] = useState<Omit<Product, 'id' | 'category'> & { category: string }>({
    name: '',
    category: categories.length > 0 ? categories[0].name : '', // Pega o nome da primeira categoria
    price: 0,
    sendToKitchen: false
  });
  
  // State for category form
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  // Reset product form
  const resetProductForm = () => {
    setProductFormData({
      name: '',
      category: categories.length > 0 ? categories[0].name : '', // Pega o nome da primeira categoria
      price: 0,
      sendToKitchen: false
    });
    setEditingProductId(null);
    setIsAddingProduct(false);
  };
  
  // Handle product form submission
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productFormData.name || !productFormData.category || productFormData.price <= 0) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }
    
    if (editingProductId) {
      updateProduct(editingProductId, productFormData);
    } else {
      addProduct(productFormData);
    }
    
    resetProductForm();
  };
  
  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setProductFormData({
      name: product.name,
      // Ao editar, usamos product.category.name porque o backend retorna um objeto Category
      category: product.category.name, 
      price: product.price,
      sendToKitchen: product.sendToKitchen
    });
    setEditingProductId(product.id);
    setIsAddingProduct(true);
  };
  
  // Handle category form submission
  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoryName) {
      toast.error('Digite um nome para a categoria');
      return;
    }
    
    if (categories.some(c => c.name === newCategoryName)) {
      toast.error('Esta categoria já existe');
      return;
    }
    
    addCategory(newCategoryName);
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  return (
    <div className="container mx-auto">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Gerenciar Produtos</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Section */}
          <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Categorias</h2>
              <button 
                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                onClick={() => setIsAddingCategory(true)}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {isAddingCategory ? (
              <div className="p-4">
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <div>
                    <label htmlFor="categoryName" className="block text-sm font-medium text-gray-400 mb-1">
                      Nome da Categoria
                    </label>
                    <input
                      type="text"
                      id="categoryName"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: Bebidas, Porções, etc."
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingCategory(false);
                        setNewCategoryName('');
                      }}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {categories.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">
                    Nenhuma categoria cadastrada
                  </div>
                ) : (
                  categories.map((category: ProductCategory) => ( // Tipagem explícita para clareza
                    <div 
                      key={category.id}
                      className="p-4 flex justify-between items-center hover:bg-gray-750"
                    >
                      <span>{category.name}</span>
                      <button
                        onClick={() => deleteCategory(category.id)}
                        className="p-1.5 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          {/* Products Section */}
          <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Produtos</h2>
              <button 
                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                onClick={() => {
                  if (categories.length === 0) {
                    toast.error('Adicione pelo menos uma categoria primeiro');
                    return;
                  }
                  resetProductForm();
                  setProductFormData(prev => ({
                    ...prev,
                    category: categories[0].name // Pega o nome da primeira categoria
                  }));
                  setIsAddingProduct(true);
                }}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {isAddingProduct ? (
              <div className="p-4">
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="productName" className="block text-sm font-medium text-gray-400 mb-1">
                      Nome do Produto
                    </label>
                    <input
                      type="text"
                      id="productName"
                      value={productFormData.name}
                      onChange={(e) => setProductFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="Ex: Cerveja, Batata Frita, etc."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="productCategory" className="block text-sm font-medium text-gray-400 mb-1">
                      Categoria
                    </label>
                    <select
                      id="productCategory"
                      value={productFormData.category}
                      onChange={(e) => setProductFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="productPrice" className="block text-sm font-medium text-gray-400 mb-1">
                      Preço (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      id="productPrice"
                      value={productFormData.price}
                      onChange={(e) => setProductFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      placeholder="0.00"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="sendToKitchen"
                      checked={productFormData.sendToKitchen}
                      onChange={(e) => setProductFormData(prev => ({ ...prev, sendToKitchen: e.target.checked }))}
                      className="w-4 h-4 bg-gray-700 border border-gray-600 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="sendToKitchen" className="ml-2 text-sm font-medium text-gray-300">
                      Enviar para a cozinha
                    </label>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={resetProductForm}
                      className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-750">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Produto
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Preço
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Cozinha
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center text-gray-400">
                          Nenhum produto cadastrado
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-750">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">{product.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {/* CORREÇÃO AQUI: Acesse product.category.name */}
                            <div className="text-sm text-gray-300">{product.category.name}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">R$ {product.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              {product.sendToKitchen ? (
                                <span className="text-emerald-400">
                                  <Check className="w-5 h-5" />
                                </span>
                              ) : (
                                <span className="text-gray-500">
                                  <X className="w-5 h-5" />
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEditProduct(product)}
                                className="p-1.5 text-blue-400 hover:bg-blue-900/20 rounded-lg transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteProduct(product.id)}
                                className="p-1.5 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;