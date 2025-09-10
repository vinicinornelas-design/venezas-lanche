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
  updated_at: string;
  pedidos_itens: Array<{
    item_cardapio_id: string;
    quantidade: number;
    preco_unitario: number;
    observacoes_item: string;
    itens_cardapio: {
      nome: string;
    };
  }>;
}

export default function PainelColaborador() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('Initializing PainelColaborador...');
        
        // Get user profile
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          
          setUserProfile(profile);
        }

        // Get pedidos
        const { data: pedidosData } = await supabase
          .from('pedidos')
          .select(`
            *,
            pedidos_itens (
              *,
              itens_cardapio (nome)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(20);

        setPedidos(pedidosData || []);
        setLoading(false);
      } catch (error) {
        console.error('Error initializing data:', error);
        setError('Erro ao carregar dados');
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Painel do Colaborador</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Painel do Colaborador</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Erro: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Painel do Colaborador</h1>
      <p className="mb-4">Olá, {userProfile?.nome || 'Usuário'}!</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-medium text-orange-800">Pedidos Pendentes</h3>
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
          <h3 className="font-medium text-purple-800">Total Hoje</h3>
          <p className="text-2xl font-bold text-purple-600">
            {pedidos.length}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {pedidos.map((pedido) => (
          <div key={pedido.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-semibold">Pedido #{pedido.id.slice(-8)}</h3>
                <p className="text-sm text-gray-600">
                  {pedido.cliente_nome} • {pedido.cliente_telefone}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(pedido.created_at).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  pedido.status === 'PENDENTE' ? 'bg-orange-100 text-orange-800' :
                  pedido.status === 'PREPARANDO' ? 'bg-blue-100 text-blue-800' :
                  pedido.status === 'PRONTO' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {pedido.status}
                </span>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {formatCurrency(pedido.total)}
                </p>
              </div>
            </div>
            
            <div className="mt-3">
              <h4 className="font-medium text-sm mb-2">Itens:</h4>
              {pedido.pedidos_itens.map((item, index) => (
                <div key={index} className="text-sm bg-gray-50 p-2 rounded mb-1">
                  {item.quantidade}x {item.itens_cardapio.nome} - {formatCurrency(item.preco_unitario)}
                </div>
              ))}
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