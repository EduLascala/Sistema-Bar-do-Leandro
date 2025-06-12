import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Coffee, 
  Clock, 
  CreditCard, 
  Plus, 
  Trash2, 
  Printer
} from 'lucide-react';
// Importe todos os tipos e funções necessários do OrderContext
import { useOrder, TableItem, OrderItem, PaymentMethod, Order, TableStatus } from '../contexts/OrderContext'; // Certifique-se de importar Order, TableItem, TableStatus

const Tables: React.FC = () => {
  const { 
    tables, 
    getTableOrder, 
    startOrder, 
    cancelOrder, 
    printKitchenOrder 
  } = useOrder();
  const navigate = useNavigate();
  
  // Function to get status color
  const getStatusColor = (status: TableStatus): string => { // Tipo TableStatus
    switch (status) {
      case 'FREE': // Use o enum em maiúsculas
        return 'bg-green-600 hover:bg-green-700';
      case 'OCCUPIED': // Use o enum em maiúsculas
        return 'bg-yellow-500 hover:bg-yellow-600';
      case 'ALERT': // Use o enum em maiúsculas
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-gray-700 hover:bg-gray-800';
    }
  };
  
  // Function to get status text
  const getStatusText = (status: TableStatus): string => { // Tipo TableStatus
    switch (status) {
      case 'FREE': // Use o enum em maiúsculas
        return 'Livre';
      case 'OCCUPIED': // Use o enum em maiúsculas
        return 'Ocupada';
      case 'ALERT': // Use o enum em maiúsculas
        return 'Alerta';
      default:
        return 'Desconhecido';
    }
  };
  
  // Function to format time since order started
  const getOrderTime = (startTime: string | null): string => { // startTime é string
    if (!startTime) return '';
    
    // Converte a string ISO 8601 para um objeto Date
    const startDateTime = new Date(startTime);
    const now = new Date();
    const diff = Math.floor((now.getTime() - startDateTime.getTime()) / 1000 / 60);
    
    if (diff < 60) {
      return `${diff} min`;
    } else {
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return `${hours}h ${mins}m`;
    }
  };
  
  // Function to handle table click - AGORA ASSÍNCRONA E AWAIT
  const handleTableClick = async (tableId: number) => { // Tornar a função assíncrona
    const table = tables.find(t => t.id === tableId);
    if (!table) return;
    
    if (table.status === 'FREE') { // Use o enum em maiúsculas
      // Aguarda a conclusão de startOrder antes de navegar
      await startOrder(tableId); 
      // Após iniciar a ordem, a navegação para /pos/{tableId} acontecerá se a ordem for bem-sucedida.
      // O OrderContext.startOrder já está configurado para atualizar o estado e toast.success.
      // A navegação para /pos/{tableId} pode ser feita após startOrder, mas com verificação
      // ou confiando que o OrderContext já lida com o estado da mesa
      navigate(`/pos/${tableId}`); // Navega após a ordem ser iniciada e a mesa atualizada no estado
    } else {
      navigate(`/pos/${tableId}`);
    }
  };
  
  return (
    <div className="container mx-auto">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold mb-6">Mesas</h1>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {tables.map((table) => {
            const order = getTableOrder(table.id);
            
            return (
              <div
                key={table.id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105 transform duration-200"
              >
                <div 
                  className={`flex items-center justify-between p-4 ${getStatusColor(table.status)}`}
                >
                  <div className="flex items-center">
                    <Coffee className="w-5 h-5 mr-2" />
                    <span className="font-medium">Mesa {table.id}</span>
                  </div>
                  <span className="text-sm font-medium">{getStatusText(table.status)}</span>
                </div>
                
                <div className="p-4">
                  {table.status !== 'FREE' && order ? ( // Use FREE
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center text-gray-400">
                          <Clock className="w-4 h-4 mr-1" />
                          <span>{getOrderTime(table.startTime)}</span>
                        </div>
                        <div className="font-medium">
                          {order.items.length} {order.items.length === 1 ? 'item' : 'itens'}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Total:</span>
                        <span className="font-medium">
                          R$ {order.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            printKitchenOrder(table.id);
                          }}
                          className="flex items-center justify-center px-2 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" />
                          Cozinha
                        </button>
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelOrder(table.id);
                          }}
                          className="flex items-center justify-center px-2 py-1.5 text-xs bg-red-600 hover:bg-red-700 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          Cancelar
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleTableClick(table.id)}
                        className="w-full mt-2 flex items-center justify-center px-3 py-2 text-sm bg-indigo-600 hover:bg-indigo-700 rounded transition-colors"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Ver Comanda
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <button
                        onClick={() => handleTableClick(table.id)}
                        className="flex items-center justify-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
                      >
                        <Plus className="w-5 h-5 mr-2" />
                        Abrir Mesa
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Tables;