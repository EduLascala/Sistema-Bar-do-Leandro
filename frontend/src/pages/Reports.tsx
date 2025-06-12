import React, { useState, useEffect, useCallback } from 'react';
import {
  Download,
  Filter,
  Trash2,
  Calendar,
  CreditCard,
  ArrowDownUp,
  Search,
  X,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns/format';
import { useOrder, Sale, PaymentMethod, SaleItem } from '../contexts/OrderContext';
import { toast } from 'react-toastify';

const formatDate = (date: string): string => {
  return format(new Date(date), 'dd/MM/yyyy HH:mm');
};

const getPaymentMethodName = (method: PaymentMethod): string => {
  switch (method) {
    case 'CASH':
      return 'Dinheiro';
    case 'PIX':
      return 'Pix';
    case 'DEBIT':
      return 'Cartão de Débito';
    case 'CREDIT':
      return 'Cartão de Crédito';
    default:
      return method;
  }
};

const Reports: React.FC = () => {
  const { sales, cancelSale, fetchAllSales } = useOrder();

  const [dateFilter, setDateFilter] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDayClosingModalOpen, setIsDayClosingModalOpen] = useState(false);

  useEffect(() => {
    // É uma boa prática carregar os dados quando o componente monta
    // se fetchAllSales não é chamado em outro lugar no fluxo principal.
    // Certifique-se de que fetchAllSales não causa renderizações excessivas.
    // fetchAllSales();
  }, []); // [] para rodar apenas uma vez na montagem

  const filteredSales = sales
    .filter(sale => {
      const saleDate = format(new Date(sale.timestamp), 'yyyy-MM-dd');
      const includesSearchTerm = sale.items.some((item: SaleItem) =>
        item.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
        (dateFilter ? saleDate === dateFilter : true) &&
        (paymentMethodFilter ? sale.paymentMethod === paymentMethodFilter.toUpperCase() : true) &&
        (searchTerm ? includesSearchTerm : true)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return sortDirection === 'asc'
          ? new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          : new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return sortDirection === 'asc'
          ? a.totalAmount - b.totalAmount
          : b.totalAmount - a.totalAmount;
      }
    });

  const salesSummary = {
    total: filteredSales.reduce((sum, sale) => sum + sale.totalAmount, 0),
    count: filteredSales.length,
    byPaymentMethod: {
      cash: filteredSales.filter(s => s.paymentMethod === 'CASH').reduce((sum, sale) => sum + sale.totalAmount, 0),
      pix: filteredSales.filter(s => s.paymentMethod === 'PIX').reduce((sum, sale) => sum + sale.totalAmount, 0),
      debit: filteredSales.filter(s => s.paymentMethod === 'DEBIT').reduce((sum, sale) => sum + sale.totalAmount, 0),
      credit: filteredSales.filter(s => s.paymentMethod === 'CREDIT').reduce((sum, sale) => sum + sale.totalAmount, 0)
    },
    topProducts: Object.entries(
      filteredSales.flatMap(sale => sale.items)
        .reduce((acc, item: SaleItem) => {
          const key = item.productName;
          if (!acc[key]) acc[key] = { quantity: 0, total: 0 };
          acc[key].quantity += item.quantity;
          acc[key].total += (item.priceAtSale ?? 0) * item.quantity;
          return acc;
        }, {} as Record<string, { quantity: number; total: number }>)
    ).sort((a, b) => b[1].quantity - a[1].quantity)
  };

  const toggleSort = (field: 'date' | 'amount') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Mesa', 'Itens', 'Total', 'Forma de Pagamento'];

    const rows = filteredSales.map(sale => [
      formatDate(sale.timestamp),
      `Mesa ${sale.tableId}`,
      sale.items.map((item: SaleItem) => `${item.quantity}x ${item.productName}`).join(', '),
      `R$ ${sale.totalAmount.toFixed(2)}`,
      getPaymentMethodName(sale.paymentMethod)
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_vendas_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClosingDay = () => {
    const closingReport = `
FECHAMENTO DO DIA - ${format(new Date(), 'dd/MM/yyyy')}

RESUMO DE VENDAS
--------------------------
Total de Vendas: R$ ${salesSummary.total.toFixed(2)}
Quantidade de Vendas: ${salesSummary.count}

VENDAS POR FORMA DE PAGAMENTO
--------------------------
Dinheiro: R$ ${salesSummary.byPaymentMethod.cash.toFixed(2)}
PIX: R$ ${salesSummary.byPaymentMethod.pix.toFixed(2)}
Cartão de Débito: R$ ${salesSummary.byPaymentMethod.debit.toFixed(2)}
Cartão de Crédito: R$ ${salesSummary.byPaymentMethod.credit.toFixed(2)}

PRODUTOS MAIS VENDIDOS
--------------------------
${salesSummary.topProducts.slice(0, 5).map(([name, data]) =>
      `${name}: ${data.quantity}x (R$ ${(data.total ?? 0).toFixed(2)})`
    ).join('\n')}
    `;

    console.log(closingReport);
    toast.success('Fechamento do dia realizado com sucesso!');
    setIsDayClosingModalOpen(false);
  };

  const showSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
  };

  const handleCancelSale = (saleId: string) => {
    if (window.confirm('Tem certeza que deseja cancelar esta venda?')) {
      cancelSale(saleId);
      setSelectedSale(null);
    }
  };

  return (
    // Removido 'container mx-auto' e 'p-4' daqui, pois o Layout.tsx já cuidará do padding principal.
    // Esta div será flex-col para organizar seu conteúdo verticalmente.
    <div className="w-full flex flex-col">
      <div className="flex flex-col flex-grow"> {/* Flex-grow para ocupar espaço vertical disponível */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold mb-4 md:mb-0">Relatório de Vendas</h1>

          {/* Botões de ação: empilham em mobile, lado a lado em sm+ */}
          {/* Alterado para forçar o empilhamento em mobile */}
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto sm:justify-end">
            <button
              onClick={() => setIsDayClosingModalOpen(true)}
              className="flex items-center justify-center px-4 py-2 bg-[#D4AF37] text-[#1C1C1E] hover:bg-[#D4AF37]/90 rounded-lg transition-colors w-full sm:w-auto"
            >
              <DollarSign className="w-5 h-5 mr-2" />
              Fechamento do Dia
            </button>

            <button
              onClick={exportToCSV}
              disabled={filteredSales.length === 0}
              className="flex items-center justify-center px-4 py-2 bg-[#2C2C2E] hover:bg-[#3C3C3E] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Sales Summary Cards - Layout responsivo para os cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#2C2C2E] p-4 rounded-lg">
            <h3 className="text-[#A0A0A0] text-sm mb-2">Total em Vendas</h3>
            <p className="text-2xl font-bold text-[#D4AF37]">
              R$ {salesSummary.total.toFixed(2)}
            </p>
            <p className="text-[#A0A0A0] text-sm mt-1">
              {salesSummary.count} vendas
            </p>
          </div>

          <div className="bg-[#2C2C2E] p-4 rounded-lg">
            <h3 className="text-[#A0A0A0] text-sm mb-2">Dinheiro/PIX</h3>
            <p className="text-xl font-bold text-white">
              R$ {(salesSummary.byPaymentMethod.cash + salesSummary.byPaymentMethod.pix).toFixed(2)}
            </p>
            <div className="text-[#A0A0A0] text-xs mt-1">
              <p>Dinheiro: R$ {salesSummary.byPaymentMethod.cash.toFixed(2)}</p>
              <p>PIX: R$ {salesSummary.byPaymentMethod.pix.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-[#2C2C2E] p-4 rounded-lg">
            <h3 className="text-[#A0A0A0] text-sm mb-2">Cartões</h3>
            <p className="text-xl font-bold text-white">
              R$ {(salesSummary.byPaymentMethod.debit + salesSummary.byPaymentMethod.credit).toFixed(2)}
            </p>
            <div className="text-[#A0A0A0] text-xs mt-1">
              <p>Débito: R$ {salesSummary.byPaymentMethod.debit.toFixed(2)}</p>
              <p>Crédito: R$ {salesSummary.byPaymentMethod.credit.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-[#2C2C2E] p-4 rounded-lg">
            <h3 className="text-[#A0A0A0] text-sm mb-2">Produtos Mais Vendidos</h3>
            <div className="space-y-1">
              {salesSummary.topProducts.slice(0, 3).map(([name, data]) => (
                <div key={name} className="flex justify-between text-sm">
                  <span className="text-white">{name}</span>
                  <span className="text-[#A0A0A0]">{data.quantity}x</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters Section - layout flexível com quebra de linha em mobile */}
        <div className="bg-[#2C2C2E] rounded-lg shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
            {/* Cada filtro agora tem 'w-full' para ocupar a largura total em mobile */}
            <div className="w-full md:w-auto flex-grow">
              <label htmlFor="dateFilter" className="block text-sm font-medium text-[#A0A0A0] mb-1">
                Data
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#A0A0A0]">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="date"
                  id="dateFilter"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-white bg-[#1C1C1E] border border-[#A0A0A0]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            <div className="w-full md:w-auto flex-grow">
              <label htmlFor="paymentMethodFilter" className="block text-sm font-medium text-[#A0A0A0] mb-1">
                Forma de Pagamento
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#A0A0A0]">
                  <CreditCard className="w-5 h-5" />
                </div>
                <select
                  id="paymentMethodFilter"
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 text-white bg-[#1C1C1E] border border-[#A0A0A0]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                >
                  <option value="">Todas</option>
                  <option value="CASH">Dinheiro</option>
                  <option value="PIX">Pix</option>
                  <option value="DEBIT">Cartão de Débito</option>
                  <option value="CREDIT">Cartão de Crédito</option>
                </select>
              </div>
            </div>

            <div className="w-full md:flex-1 flex-grow">
              <label htmlFor="searchTerm" className="block text-sm font-medium text-[#A0A0A0] mb-1">
                Buscar Produtos
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#A0A0A0]">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  id="searchTerm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Busque por nome de produto..."
                  className="block w-full pl-10 pr-3 py-2 text-white bg-[#1C1C1E] border border-[#A0A0A0]/20 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>
            </div>

            {/* O botão Limpar Filtros também deve ter 'w-full' em mobile */}
            <div className="self-end mt-6 md:mt-0 w-full md:w-auto">
              <button
                onClick={() => {
                  setDateFilter('');
                  setPaymentMethodFilter('');
                  setSearchTerm('');
                }}
                className="flex items-center justify-center px-4 py-2 bg-[#1C1C1E] hover:bg-[#2C2C2E] rounded-lg transition-colors w-full"
              >
                <Filter className="w-5 h-5 mr-2" />
                Limpar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Sales Table - DESKTOP/TABLET VIEW (standard table) */}
        <div className="bg-[#2C2C2E] rounded-lg shadow-lg overflow-hidden hidden sm:block"> {/* Hidden on small screens, shown on sm+ */}
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#1C1C1E] sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => toggleSort('date')}>
                    Data/Hora
                    <ArrowDownUp className={`w-4 h-4 ml-1 ${sortBy === 'date' ? 'text-[#D4AF37]' : 'text-[#A0A0A0]'}`} />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                  Mesa
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider"> {/* No hidden here, showing all columns on desktop/tablet */}
                  Itens
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                  <button className="flex items-center focus:outline-none" onClick={() => toggleSort('amount')}>
                    Total
                    <ArrowDownUp className={`w-4 h-4 ml-1 ${sortBy === 'amount' ? 'text-[#D4AF37]' : 'text-[#A0A0A0]'}`} />
                  </button>
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider"> {/* No hidden here, showing all columns on desktop/tablet */}
                  Pagamento
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#2C2C2E] divide-y divide-gray-700">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-[#A0A0A0]">
                    Nenhuma venda encontrada
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-[#3C3C3E] cursor-pointer"
                    onClick={() => showSaleDetails(sale)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {formatDate(sale.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      Mesa {sale.tableId}
                    </td>
                    <td className="px-6 py-4 text-sm"> {/* Show on desktop/tablet */}
                      <div className="line-clamp-1">
                        {sale.items.map((item: SaleItem, index) => (
                          <span key={index}>
                            {index > 0 && ', '}
                            {item.quantity}x {item.productName}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      R$ {sale.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm"> {/* Show on desktop/tablet */}
                      {getPaymentMethodName(sale.paymentMethod)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelSale(sale.id);
                        }}
                        className="p-1.5 text-[#FF3B30] hover:bg-[#FF3B30]/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Sales List - MOBILE VIEW (card-like) */}
        <div className="bg-[#2C2C2E] rounded-lg shadow-lg sm:hidden"> {/* Hidden on sm+ screens, shown on small screens */}
          <div className="divide-y divide-gray-700">
            {filteredSales.length === 0 ? (
              <div className="p-4 text-center text-[#A0A0A0]">
                Nenhuma venda encontrada
              </div>
            ) : (
              filteredSales.map((sale) => (
                <div
                  key={sale.id}
                  className="p-4 hover:bg-[#3C3C3E] cursor-pointer flex flex-col space-y-2"
                  onClick={() => showSaleDetails(sale)}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-sm">{formatDate(sale.timestamp)}</span>
                    <span className="font-medium text-sm">Mesa {sale.tableId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#A0A0A0] text-sm">Total:</span>
                    <span className="font-bold text-base text-white">R$ {sale.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="text-[#A0A0A0] text-xs">
                    Itens: <span className="text-white line-clamp-1">{sale.items.map(item => `${item.quantity}x ${item.productName}`).join(', ')}</span>
                  </div>
                  <div className="text-[#A0A0A0] text-xs">
                    Pagamento: <span className="text-white">{getPaymentMethodName(sale.paymentMethod)}</span>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancelSale(sale.id);
                      }}
                      className="p-1.5 text-[#FF3B30] hover:bg-[#FF3B30]/20 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sale Details Modal - já é fixed e centralizado, deve ser responsivo */}
      {selectedSale && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2C2C2E] rounded-lg shadow-xl max-w-2xl w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-bold">Detalhes da Venda</h2>
                <p className="text-[#A0A0A0] text-sm">
                  {formatDate(selectedSale.timestamp)} - Mesa {selectedSale.tableId}
                </p>
              </div>
              <button
                onClick={() => setSelectedSale(null)}
                className="p-1 hover:bg-[#3C3C3E] rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6 max-h-80 overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-[#1C1C1E]">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                      Produto
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                      Qtd
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                      Preço Unit.
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-[#A0A0A0] uppercase tracking-wider">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-[#2C2C2E] divide-y divide-gray-700">
                  {selectedSale.items.map((item: SaleItem, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm">{item.productName}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm">{item.quantity}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="text-sm">R$ {(item.priceAtSale ?? 0).toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-right">
                        <div className="text-sm">R$ {((item.priceAtSale ?? 0) * item.quantity).toFixed(2)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-[#1C1C1E]">
                  <tr>
                    <td colSpan={3} className="px-4 py-2 text-right font-medium">
                      Total:
                    </td>
                    <td className="px-4 py-2 text-right font-bold">
                      R$ {selectedSale.totalAmount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center bg-[#1C1C1E] p-3 rounded-lg gap-3">
              <div>
                <span className="text-sm text-[#A0A0A0]">Forma de Pagamento:</span>
                <div className="font-medium">{getPaymentMethodName(selectedSale.paymentMethod)}</div>
              </div>

              <button
                onClick={() => handleCancelSale(selectedSale.id)}
                className="flex items-center justify-center px-3 py-2 bg-[#FF3B30] hover:bg-[#FF3B30]/90 rounded-lg transition-colors w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Cancelar Venda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day Closing Modal - já é fixed e centralizado, deve ser responsivo */}
      {isDayClosingModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#2C2C2E] rounded-lg shadow-xl max-w-2xl w-full p-6 animate-fade-in">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold">Fechamento do Dia</h2>
              <button
                onClick={() => setIsDayClosingModalOpen(false)}
                className="p-1 hover:bg-[#3C3C3E] rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-[#1C1C1E] p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Resumo de Vendas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Total em Vendas:</span>
                    <span className="font-medium">R$ {salesSummary.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Quantidade de Vendas:</span>
                    <span className="font-medium">{salesSummary.count}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1C1C1E] p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Por Forma de Pagamento</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Dinheiro:</span>
                    <span className="font-medium">R$ {salesSummary.byPaymentMethod.cash.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">PIX:</span>
                    <span className="font-medium">R$ {salesSummary.byPaymentMethod.pix.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Cartão de Débito:</span>
                    <span className="font-medium">R$ {salesSummary.byPaymentMethod.debit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#A0A0A0]">Cartão de Crédito:</span>
                    <span className="font-medium">R$ {salesSummary.byPaymentMethod.credit.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#1C1C1E] p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-3">Produtos Mais Vendidos</h3>
                <div className="space-y-2">
                  {salesSummary.topProducts.slice(0, 5).map(([name, data]) => (
                    <div key={name} className="flex justify-between">
                      <span className="text-[#A0A0A0]">{name}:</span>
                      <span className="font-medium">
                        {data.quantity}x (R$ ${(data.total ?? 0).toFixed(2)})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setIsDayClosingModalOpen(false)}
                  className="px-4 py-2 bg-[#1C1C1E] hover:bg-[#3C3C3E] rounded-lg transition-colors w-full sm:w-auto"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleClosingDay}
                  className="px-4 py-2 bg-[#D4AF37] text-[#1C1C1E] hover:bg-[#D4AF37]/90 rounded-lg transition-colors w-full sm:w-auto"
                >
                  Confirmar Fechamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;