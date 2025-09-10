import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Pedido {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  total: number;
  status: string;
  observacoes: string;
  origem: string;
  created_at: string;
  pedidos_itens: Array<{
    quantidade: number;
    preco_unitario: number;
    itens_cardapio: {
      nome: string;
    };
  }>;
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        console.log('Fetching pedidos...');
        
        const { data, error } = await supabase
          .from('pedidos')
          .select(`
            id,
            cliente_nome,
            cliente_telefone,
            total,
            status,
            observacoes,
            origem,
            created_at,
            pedidos_itens (
              quantidade,
              preco_unitario,
              itens_cardapio (nome)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Error fetching pedidos:', error);
          setError('Erro ao carregar pedidos: ' + error.message);
        } else {
          console.log('Pedidos loaded:', data?.length || 0);
          setPedidos(data || []);
        }
      } catch (err) {
        console.error('Error in fetchPedidos:', err);
        setError('Erro ao carregar pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
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

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Pedidos</h1>
        <p>Carregando pedidos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Pedidos</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-800">Erro</h3>
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Tentar Novamente
          </button>
        </div>
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
                <h3 className="font-semibold text-lg">Pedido #{pedido.id.slice(-8)}</h3>
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
            
            <div className="mt-3">
              <h4 className="font-medium text-sm mb-2">Itens:</h4>
              <div className="space-y-1">
                {pedido.pedidos_itens.map((item, index) => (
                  <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                    {item.quantidade}x {item.itens_cardapio.nome} - {formatCurrency(item.preco_unitario)}
                  </div>
                ))}
              </div>
            </div>

            {pedido.observacoes && (
              <div className="mt-3 bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800 mb-1">Observações:</p>
                <p className="text-sm text-blue-700">{pedido.observacoes}</p>
              </div>
            )}
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