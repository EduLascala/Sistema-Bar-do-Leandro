import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import API_BASE_URL from '../config/api'; // Importa a URL base da API
import { toast } from 'react-toastify';

// Tipos - Mantenha-os compatíveis com suas entidades Java
export type TableStatus = 'FREE' | 'OCCUPIED' | 'ALERT'; // Enums do backend são em maiúsculas

export interface TableItem {
  id: number;
  status: TableStatus;
  orderId: string | null;
  startTime: string | null; // LocalDateTime do Java vem como string ISO 8601
}

// ATENÇÃO: INTERFACE OrderItem ATUALIZADA PARA CORRESPONDER AO BACKEND
export interface OrderItem {
  id?: number; // ID do OrderItem no backend (Long em Java, number em TS)
  product: { // O backend envia o objeto Product aninhado dentro do OrderItem
    id: string;
    name: string; // Nome do produto vindo do Product aninhado
    price: number; // Preço do produto vindo do Product aninhado (não priceAtOrder)
    sendToKitchen: boolean; // Flag 'para cozinha' do produto
  };
  quantity: number;
  priceAtOrder: number; // Preço do item no momento da ordem (campo específico da entidade OrderItem, double em Java, number em TS)
  sendToKitchen: boolean; // Flag 'para cozinha' do item (campo específico da entidade OrderItem)
}

export type PaymentMethod = 'CASH' | 'PIX' | 'DEBIT' | 'CREDIT'; // Enums do backend

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  totalAmount: number;
  startTime: string; // LocalDateTime do Java vem como string ISO 8601
  endTime: string | null;
  status: 'OPEN' | 'PAID' | 'CANCELED'; // Enums do backend
  paymentMethod: PaymentMethod | null;
}

export interface Sale {
  id: string;
  orderId: string | null;
  tableId: number;
  items: SaleItem[]; // Agora são SaleItem[], não OrderItem[]
  totalAmount: number;
  paymentMethod: PaymentMethod;
  timestamp: string; // LocalDateTime do Java vem como string ISO 8601
}

export interface SaleItem {
  id?: number; // ID do SaleItem
  productId: string;
  productName: string; // Nome do produto no momento da venda
  priceAtSale: number; // Preço no momento da venda
  quantity: number;
  sendToKitchen: boolean;
}

interface OrderContextType {
  tables: TableItem[];
  orders: Record<string, Order>;
  sales: Sale[];
  getTable: (tableId: number) => TableItem | undefined;
  getTableOrder: (tableId: number) => Order | undefined;
  startOrder: (tableId: number) => Promise<void>;
  addItemToOrder: (tableId: number, item: { productId: string; quantity: number }) => Promise<void>;
  removeItemFromOrder: (tableId: number, orderItemId: number) => Promise<void>;
  updateItemQuantity: (tableId: number, orderItemId: number, quantity: number) => Promise<void>;
  closeOrder: (tableId: number, paymentMethod: PaymentMethod) => Promise<void>;
  cancelOrder: (tableId: number) => Promise<void>;
  cancelSale: (saleId: string) => Promise<void>;
  printKitchenOrder: (tableId: number) => void;
  printReceipt: (tableId: number) => void;
  fetchAllSales: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const [tables, setTables] = useState<TableItem[]>([]);
  const [orders, setOrders] = useState<Record<string, Order>>({}); // Estado para armazenar as ordens ativas
  const [sales, setSales] = useState<Sale[]>([]);

  // Funções de fetch para manter o estado sincronizado
  const fetchTables = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_BASE_URL}/tables`);
      if (response.ok) {
        const data: TableItem[] = await response.json();
        setTables(data);
      } else {
        toast.error('Falha ao carregar mesas.');
      }
    } catch (error) {
      console.error('Erro ao buscar mesas:', error);
      toast.error('Erro de conexão ao buscar mesas.');
    }
  }, [currentUser]);

  // Função para buscar a ordem ativa de uma mesa específica
  const fetchOrderForTable = useCallback(async (tableId: number) => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${tableId}/active`);
      if (response.ok) {
        const data: Order = await response.json();
        setOrders(prev => ({ ...prev, [data.id]: data })); // Adiciona/atualiza a ordem no mapa de ordens
        return data;
      } else if (response.status === 404) {
        // Se a ordem não for encontrada (mesa livre), remover do estado local
        setOrders(prev => { 
            const newOrders = { ...prev };
            const orderToDeleteId = Object.values(prev).find(o => o.tableId === tableId)?.id;
            if(orderToDeleteId) delete newOrders[orderToDeleteId];
            return newOrders;
        });
        return undefined;
      } else {
        toast.error(`Falha ao carregar comanda da mesa ${tableId}.`);
      }
    } catch (error) {
      console.error(`Erro ao buscar comanda da mesa ${tableId}:`, error);
      toast.error('Erro de conexão ao buscar comanda.');
    }
    return undefined;
  }, [currentUser]);

  // Função para buscar todas as vendas
  const fetchAllSales = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await fetch(`${API_BASE_URL}/reports/sales`);
      if (response.ok) {
        const data: Sale[] = await response.json();
        setSales(data);
      } else {
        toast.error('Falha ao carregar vendas.');
      }
    } catch (error) {
      console.error('Erro ao buscar vendas:', error);
      toast.error('Erro de conexão ao buscar vendas.');
    }
  }, [currentUser]);

  // Efeitos para carregar dados iniciais e monitorar
  useEffect(() => {
    if (currentUser) {
      fetchTables();
      fetchAllSales();
      // O monitoramento de status da mesa (alertas) é feito pelo backend.
      // O frontend apenas busca as mesas periodicamente para refletir o estado.
      const interval = setInterval(() => {
        fetchTables();
      }, 60000); // A cada 1 minuto
      return () => clearInterval(interval);
    } else {
      // Limpar estados se o usuário não estiver logado
      setTables([]);
      setOrders({});
      setSales([]);
    }
  }, [currentUser, fetchTables, fetchAllSales]);

  // Métodos do contexto
  const getTable = (tableId: number) => {
    return tables.find(table => table.id === tableId);
  };

  const getTableOrder = (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    return table?.orderId ? orders[table.orderId] : undefined;
  };

  const startOrder = async (tableId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/start/${tableId}`, {
        method: 'POST',
      });
      if (response.ok) {
        const newOrder: Order = await response.json();
        setOrders(prev => ({ ...prev, [newOrder.id]: newOrder })); // Adiciona a nova ordem ao mapa
        toast.success(`Mesa ${tableId} aberta com sucesso!`);
        await fetchTables(); // Atualiza a lista de mesas para refletir o status OCCUPIED
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao abrir mesa: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao iniciar comanda:', error);
      toast.error('Erro de conexão ao abrir mesa.');
    }
  };

  // addItemToOrder agora espera um objeto com productId e quantity
  const addItemToOrder = async (tableId: number, itemData: { productId: string; quantity: number }) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.orderId) {
      toast.error('Mesa não tem comanda ativa.');
      return;
    }
    const orderId = table.orderId;

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/add-item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData), // Envia apenas productId e quantity
      });
      if (response.ok) {
        const updatedOrder: Order = await response.json();
        setOrders(prev => ({ ...prev, [updatedOrder.id]: updatedOrder })); // Atualiza a ordem no mapa
        // toast.success(`Item adicionado à mesa ${tableId}!`); // Comentado para evitar muitos toasts
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao adicionar item: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao adicionar item à comanda:', error);
      toast.error('Erro de conexão ao adicionar item.');
    }
  };

  // removeItemFromOrder agora recebe orderItemId (o ID do OrderItem no backend)
  const removeItemFromOrder = async (tableId: number, orderItemId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.orderId) {
      toast.error('Mesa não tem comanda ativa.');
      return;
    }
    const orderId = table.orderId;

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/remove-item/${orderItemId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const updatedOrder: Order = await response.json();
        setOrders(prev => ({ ...prev, [updatedOrder.id]: updatedOrder })); // Atualiza a ordem no mapa
        toast.info(`Item removido da mesa ${tableId}.`);
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao remover item: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao remover item da comanda:', error);
      toast.error('Erro de conexão ao remover item.');
    }
  };

  // updateItemQuantity também recebe orderItemId
  const updateItemQuantity = async (tableId: number, orderItemId: number, quantity: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.orderId) {
      toast.error('Mesa não tem comanda ativa.');
      return;
    }
    const orderId = table.orderId;

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/update-item-quantity/${orderItemId}`, {
        method: 'PUT', // PUT para atualização
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ newQuantity: quantity }), // Envia newQuantity
      });
      if (response.ok) {
        const updatedOrder: Order = await response.json();
        setOrders(prev => ({ ...prev, [updatedOrder.id]: updatedOrder })); // Atualiza a ordem no mapa
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao atualizar quantidade: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
      toast.error('Erro de conexão ao atualizar quantidade.');
    }
  };

  const closeOrder = async (tableId: number, paymentMethod: PaymentMethod) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.orderId) {
      toast.error('Mesa não tem comanda ativa.');
      return;
    }
    const orderId = table.orderId;

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/close`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ paymentMethod }), // Envia o método de pagamento
      });
      if (response.ok) {
        toast.success(`Atendimento da Mesa ${tableId} finalizado com sucesso!`);
        await fetchTables(); // Atualiza a lista de mesas para liberar a mesa
        await fetchAllSales(); // Atualiza a lista de vendas (para relatórios)
        setOrders(prev => { // Remove a ordem fechada do estado local
            const newOrders = { ...prev };
            delete newOrders[orderId];
            return newOrders;
        });
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao finalizar atendimento: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao finalizar atendimento:', error);
      toast.error('Erro de conexão ao finalizar atendimento.');
    }
  };

  const cancelOrder = async (tableId: number) => {
    const table = tables.find(t => t.id === tableId);
    if (!table || !table.orderId) {
      toast.error('Mesa não tem comanda ativa para cancelar.');
      return;
    }
    const orderId = table.orderId;

    try {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.info(`Comanda da Mesa ${tableId} cancelada.`);
        await fetchTables(); // Atualiza a lista de mesas para liberar a mesa
        setOrders(prev => { // Remove a ordem cancelada do estado local
            const newOrders = { ...prev };
            delete newOrders[orderId];
            return newOrders;
        });
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao cancelar comanda: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao cancelar comanda:', error);
      toast.error('Erro de conexão ao cancelar comanda.');
    }
  };

  const cancelSale = async (saleId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/reports/sales/${saleId}`, {
        method: 'DELETE',
      });
      if (response.ok) { // 204 No Content é sucesso
        toast.success('Venda cancelada com sucesso!');
        await fetchAllSales(); // Recarrega a lista de vendas
      } else {
        const errorText = await response.text();
        toast.error(`Falha ao cancelar venda: ${errorText}`);
      }
    } catch (error) {
      console.error('Erro ao cancelar venda:', error);
      toast.error('Erro de conexão ao cancelar venda.');
    }
  };

  // Estas funções apenas logarão no console do navegador por enquanto,
  // pois a integração real com impressoras não é parte do escopo atual.
  const printKitchenOrder = (tableId: number) => {
    const order = getTableOrder(tableId);
    if (!order) return;
    // No frontend OrderItem agora tem product.name
    const kitchenItems = order.items.filter(item => item.sendToKitchen).map(item => ({
        name: item.product.name, // Acessa o nome do produto
        quantity: item.quantity
    }));
    if (kitchenItems.length === 0) {
      toast.info('Nenhum item para cozinha nesta comanda.');
      return;
    }
    console.log('KITCHEN ORDER - MESA ' + tableId, kitchenItems);
    toast.success('Pedido enviado para a cozinha (simulado)!');
  };

  const printReceipt = (tableId: number) => {
    const order = getTableOrder(tableId);
    if (!order) return;
    // No frontend OrderItem agora tem product.name e priceAtOrder
    const receiptDetails = {
        tableId: order.tableId,
        orderId: order.id,
        totalAmount: order.totalAmount,
        items: order.items.map(item => ({
            name: item.product.name, // Acessa o nome do produto
            quantity: item.quantity,
            price: item.priceAtOrder
        }))
    };
    console.log('RECEIPT - MESA ' + tableId, receiptDetails);
    toast.success('Recibo impresso (simulado)!');
  };

  const value = {
    tables,
    orders,
    sales,
    getTable,
    getTableOrder,
    startOrder,
    addItemToOrder,
    removeItemFromOrder,
    updateItemQuantity,
    closeOrder,
    cancelOrder,
    cancelSale,
    printKitchenOrder,
    printReceipt,
    fetchAllSales,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};