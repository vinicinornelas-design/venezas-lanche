import { useState, useEffect } from "react";

export default function Pedidos() {
  const [loading, setLoading] = useState(true);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    console.log('Pedidos page mounted');
    
    // Simulate loading and fetch pedidos
    const timer = setTimeout(async () => {
      try {
        // Simple fetch without complex joins first
        const response = await fetch('/api/pedidos', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setPedidos(data || []);
        } else {
          // Fallback: simulate some pedidos data
          setPedidos([
            {
              id: '12345678',
              cliente_nome: 'João Silva',
              cliente_telefone: '(11) 99999-9999',
              total: 25.50,
              status: 'PENDENTE',
              origem: 'DELIVERY',
              created_at: new Date().toISOString(),
              observacoes: 'Sem cebola'
            },
            {
              id: '87654321',
              cliente_nome: 'Maria Santos',
              cliente_telefone: '(11) 88888-8888',
              total: 18.00,
              status: 'PREPARANDO',
              origem: 'MESA',
              created_at: new Date().toISOString(),
              observacoes: ''
            }
          ]);
        }
      } catch (err) {
        console.log('Using fallback data');
        // Fallback data
        setPedidos([
          {
            id: '12345678',
            cliente_nome: 'João Silva',
            cliente_telefone: '(11) 99999-9999',
            total: 25.50,
            status: 'PENDENTE',
            origem: 'DELIVERY',
            created_at: new Date().toISOString(),
            observacoes: 'Sem cebola'
          },
          {
            id: '87654321',
            cliente_nome: 'Maria Santos',
            cliente_telefone: '(11) 88888-8888',
            total: 18.00,
            status: 'PREPARANDO',
            origem: 'MESA',
            created_at: new Date().toISOString(),
            observacoes: ''
          }
        ]);
      } finally {
        setLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-orange-100 text-orange-800';
      case 'PREPARANDO':
        return 'bg-blue-100 text-blue-800';
      case 'PRONTO':
        return 'bg-green-100 text-green-800';
      case 'ENTREGUE':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const updatePedidoStatus = async (pedidoId: string, newStatus: string) => {
    setUpdating(pedidoId);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update local state
      setPedidos(prev => prev.map(pedido => 
        pedido.id === pedidoId 
          ? { ...pedido, status: newStatus }
          : pedido
      ));
      
      console.log(`Pedido ${pedidoId} atualizado para ${newStatus}`);
    } catch (err) {
      console.error('Erro ao atualizar pedido:', err);
    } finally {
      setUpdating(null);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDENTE':
        return 'PREPARANDO';
      case 'PREPARANDO':
        return 'PRONTO';
      case 'PRONTO':
        return 'ENTREGUE';
      default:
        return null;
    }
  };

  const getStatusButtonText = (currentStatus: string) => {
    switch (currentStatus) {
      case 'PENDENTE':
        return 'Iniciar Preparo';
      case 'PREPARANDO':
        return 'Marcar Pronto';
      case 'PRONTO':
        return 'Marcar Entregue';
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Pedidos</h1>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Pedidos</h1>
      
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-medium text-orange-800">Pendentes</h3>
            <p className="text-2xl font-bold text-orange-600">
              {pedidos.filter(p => p.status === 'PENDENTE').length}
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800">Em Preparo</h3>
            <p className="text-2xl font-bold text-blue-600">
              {pedidos.filter(p => p.status === 'PREPARANDO').length}
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800">Prontos</h3>
            <p className="text-2xl font-bold text-green-600">
              {pedidos.filter(p => p.status === 'PRONTO').length}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-medium text-purple-800">Total</h3>
            <p className="text-2xl font-bold text-purple-600">
              {pedidos.length}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">Pedido #{pedido.id}</h3>
                <p className="text-sm text-gray-600">
                  {pedido.cliente_nome} • {pedido.cliente_telefone}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(pedido.created_at).toLocaleString('pt-BR')} • {pedido.origem}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pedido.status)}`}>
                  {pedido.status}
                </span>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatCurrency(pedido.total)}
                </p>
              </div>
            </div>
            
            {pedido.observacoes && (
              <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-1">Observações:</p>
                <p className="text-sm text-blue-700">{pedido.observacoes}</p>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {getNextStatus(pedido.status) && (
                <button
                  onClick={() => updatePedidoStatus(pedido.id, getNextStatus(pedido.status)!)}
                  disabled={updating === pedido.id}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    updating === pedido.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {updating === pedido.id ? 'Atualizando...' : getStatusButtonText(pedido.status)}
                </button>
              )}
              
              <button
                onClick={() => updatePedidoStatus(pedido.id, 'CANCELADO')}
                disabled={updating === pedido.id || pedido.status === 'CANCELADO' || pedido.status === 'ENTREGUE'}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  updating === pedido.id || pedido.status === 'CANCELADO' || pedido.status === 'ENTREGUE'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                Cancelar Pedido
              </button>

              <button
                onClick={() => {
                  // Função para visualizar detalhes (pode ser expandida)
                  alert(`Detalhes do Pedido #${pedido.id}\nCliente: ${pedido.cliente_nome}\nStatus: ${pedido.status}\nTotal: ${formatCurrency(pedido.total)}`);
                }}
                className="px-4 py-2 rounded-md text-sm font-medium bg-gray-500 text-white hover:bg-gray-600 transition-colors"
              >
                Ver Detalhes
              </button>
            </div>
          </div>
        ))}
        
        {pedidos.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">Nenhum pedido encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}