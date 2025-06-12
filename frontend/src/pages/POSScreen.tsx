import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Plus,
  Minus,
  ShoppingCart,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useOrder, OrderItem, PaymentMethod, Order, TableItem } from '../contexts/OrderContext';
import { useProduct, Product } from '../contexts/ProductContext';

const POSScreen: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { 
    getTable, 
    getTableOrder, 
    addItemToOrder, 
    removeItemFromOrder, 
    updateItemQuantity,
    closeOrder
  } = useOrder();
  const { products, categories } = useProduct();
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  
  const tableIdNum = parseInt(tableId || '0', 10);

  const [currentTable, setCurrentTable] = useState<TableItem | undefined>(undefined);
  const [currentOrder, setCurrentOrder] = useState<Order | undefined>(undefined);

  // Efeito para buscar e manter o estado da mesa e da ordem
  useEffect(() => {
    const table = getTable(tableIdNum);
    setCurrentTable(table);
    if (table?.orderId) {
      setCurrentOrder(getTableOrder(tableIdNum));
    } else {
      setCurrentOrder(undefined);
    }
  }, [tableIdNum, getTable, getTableOrder, useOrder().tables, useOrder().orders]); 

  // Set the first category as selected when component mounts
  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].name);
    }
  }, [categories, selectedCategory]);
  
  // Redirect to tables if table not found or table is free
  useEffect(() => {
    if (!currentTable) {
      return; 
    }
    
    if (currentTable.status === 'FREE') {
      toast.error('Mesa não está ocupada ou foi liberada.');
      navigate('/tables');
    }
  }, [currentTable, navigate]);
  
  // Filter products by selected category
  const filteredProducts = selectedCategory
    ? products.filter(product => product.category.name === selectedCategory)
    : products;
  
  // Add item to order
  const handleAddItem = useCallback((product: Product) => {
    const itemPayload = { 
      productId: product.id, 
      quantity: 1 
    };
    addItemToOrder(tableIdNum, itemPayload);
  }, [addItemToOrder, tableIdNum]);

  // Handle payment confirmation
  const handlePaymentConfirm = useCallback(() => {
    if (!selectedPaymentMethod) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }
    closeOrder(tableIdNum, selectedPaymentMethod);
    setIsPaymentModalOpen(false);
  }, [closeOrder, tableIdNum, selectedPaymentMethod]);
  
  if (!currentTable || (currentTable.status !== 'FREE' && !currentOrder)) {
    return <div className="text-center py-10">Carregando...</div>;
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate('/tables')}
          className="mr-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">Mesa {tableIdNum}</h1>
      </div>
      
      {/* Principal grid layout - se torna uma coluna em telas menores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna de Adicionar Produtos - ocupa a largura total em mobile, 2/3 em lg */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4 bg-gray-700">
            <h2 className="text-lg font-semibold">Adicionar Produtos</h2>
          </div>
          
          {/* Category Tabs - barra de rolagem horizontal em mobile */}
          <div className="flex overflow-x-auto p-2 bg-gray-750 border-b border-gray-700">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 mx-1 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  selectedCategory === category.name
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                onClick={() => setSelectedCategory(category.name)}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          {/* Products Grid - ajusta o número de colunas conforme a tela */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-4 max-h-[calc(100vh-400px)] overflow-y-auto">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                className="bg-gray-700 hover:bg-gray-650 p-4 rounded-lg text-left transition-all hover:shadow-md hover:-translate-y-1 transform duration-200"
                onClick={() => handleAddItem(product)}
              >
                <div className="flex flex-col h-full">
                  <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-emerald-400 font-semibold">
                      R$ {product.price.toFixed(2)}
                    </span>
                    <Plus className="w-5 h-5 text-emerald-400" />
                  </div>
                  {product.sendToKitchen && (
                    <span className="mt-2 text-xs px-2 py-0.5 bg-yellow-800 text-yellow-300 rounded-full inline-block">
                      Cozinha
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
        
        {/* Coluna de Comanda - ocupa a largura total em mobile, 1/3 em lg */}
        {/* h-[calc(100vh-200px)] pode ser demais em mobile, vamos ajustar ou usar um min-h */}
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden flex flex-col h-full md:h-[calc(100vh-200px)]"> 
          <div className="p-4 bg-gray-700">
            <h2 className="text-lg font-semibold">Comanda</h2>
          </div>
          
          {/* Order Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {currentOrder?.items.length === 0 ? (
              <div className="text-center py-6 text-gray-400">
                <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p>Nenhum item adicionado</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentOrder?.items.map((item, index) => (
                  <div 
                    key={item.id || index} 
                    className="flex justify-between items-center p-3 bg-gray-750 rounded-lg"
                  >
                    <div className="flex-1">
                      <h3 className="font-medium">{item.product.name}</h3>
                      <p className="text-sm text-gray-400">
                        R$ {(item.priceAtOrder ?? 0).toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                        onClick={() => updateItemQuantity(tableIdNum, item.id!, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      
                      <span className="w-8 text-center">{item.quantity}</span>
                      
                      <button 
                        className="p-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                        onClick={() => updateItemQuantity(tableIdNum, item.id!, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      
                      <button 
                        className="p-1 bg-red-700 hover:bg-red-600 rounded transition-colors ml-2"
                        onClick={() => removeItemFromOrder(tableIdNum, item.id!)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Order Total */}
          <div className="p-4 bg-gray-750 border-t border-gray-700">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Subtotal:</span>
              <span>R$ {currentOrder?.totalAmount.toFixed(2)}</span>
            </div>
            
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              disabled={currentOrder?.items.length === 0}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              Fechar Atendimento
            </button>
          </div>
        </div>
      </div>
      
      {/* Payment Modal (já é fixed e centralizado, deve ser responsivo) */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-lg w-full p-6 animate-fade-in">
            <h2 className="text-xl font-bold mb-4">Finalizar Pedido</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Resumo do Pedido</h3>
              {/* Ajuste de altura máxima para rolagem em mobile */}
              <div className="max-h-60 sm:max-h-80 overflow-y-auto mb-4"> 
                {currentOrder?.items.map((item, index) => (
                  <div key={item.id || index} className="flex justify-between py-2 border-b border-gray-700">
                    <span>{item.quantity}x {item.product.name}</span>
                    <span>R$ {((item.priceAtOrder ?? 0) * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>R$ {currentOrder?.totalAmount.toFixed(2)}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-3">Forma de Pagamento</h3>
            {/* Grid de métodos de pagamento - se torna 1 coluna em telas menores */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6"> 
              <button
                className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                  selectedPaymentMethod === 'CASH'
                    ? 'border-emerald-500 bg-emerald-900/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedPaymentMethod('CASH')}
              >
                <Banknote className="w-8 h-8 mb-2" />
                <span>Dinheiro</span>
              </button>
              
              <button
                className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                  selectedPaymentMethod === 'PIX'
                    ? 'border-emerald-500 bg-emerald-900/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedPaymentMethod('PIX')}
              >
                <QrCode className="w-8 h-8 mb-2" />
                <span>Pix</span>
              </button>
              
              <button
                className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                  selectedPaymentMethod === 'DEBIT'
                    ? 'border-emerald-500 bg-emerald-900/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedPaymentMethod('DEBIT')}
              >
                <CreditCard className="w-8 h-8 mb-2" />
                <span>Cartão de Débito</span>
              </button>
              
              <button
                className={`p-4 rounded-lg border-2 flex flex-col items-center justify-center transition-colors ${
                  selectedPaymentMethod === 'CREDIT'
                    ? 'border-emerald-500 bg-emerald-900/20'
                    : 'border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => setSelectedPaymentMethod('CREDIT')}
              >
                <CreditCard className="w-8 h-8 mb-2" />
                <span>Cartão de Crédito</span>
              </button>
            </div>
            
            <div className="flex space-x-3">
              <button
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                onClick={() => setIsPaymentModalOpen(false)}
              >
                Cancelar
              </button>
              
              <button
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedPaymentMethod}
                onClick={handlePaymentConfirm}
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default POSScreen;