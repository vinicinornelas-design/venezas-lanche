import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { PedidoUnificado, formatarStatusPedido, formatarOrigemPedido } from "@/types/pedidos-unificados";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<PedidoUnificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchPedidos();
    setupRealtimeSubscription();
    
    // Cleanup subscription on unmount
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('pedidos_unificados')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        throw error;
      }

      // Ordenação personalizada: PENDENTE > PREPARANDO > PRONTO > ENTREGUE > CANCELADO
      const sortedPedidos = (data || []).sort((a, b) => {
        const statusOrder = {
          'PENDENTE': 1,
          'PREPARANDO': 2,
          'PRONTO': 3,
          'ENTREGUE': 4,
          'CANCELADO': 5
        };
        
        const aOrder = statusOrder[a.status as keyof typeof statusOrder] || 6;
        const bOrder = statusOrder[b.status as keyof typeof statusOrder] || 6;
        
        // Se o status for igual, ordenar por data de criação (mais recente primeiro)
        if (aOrder === bOrder) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
        
        return aOrder - bOrder;
      });

      setPedidos(sortedPedidos);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log('Configurando subscription de pedidos...');
    
    const channel = supabase
      .channel('pedidos-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'pedidos_unificados',
        },
        (payload) => {
          console.log('Mudança detectada na tabela pedidos_unificados:', payload);
          
          // Recarregar pedidos quando houver mudanças
          fetchPedidos();
        }
      )
      .subscribe((status, err) => {
        console.log('Status da subscription de pedidos:', status);
        if (err) {
          console.error('Erro na subscription de pedidos:', err);
        }
        
        if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          console.log('Tentando reconectar subscription de pedidos...');
          setTimeout(() => {
            setupRealtimeSubscription();
          }, 5000);
        }
      });

    return () => {
      console.log('Removendo subscription de pedidos');
      supabase.removeChannel(channel);
    };
  };

  const updatePedidoStatus = async (pedidoId: string, newStatus: string) => {
    try {
      setUpdating(prev => ({ ...prev, [pedidoId]: true }));
      
      // Buscar dados atuais do pedido para obter o valor total
      const pedidoAtual = pedidos.find(p => p.id === pedidoId);
      if (!pedidoAtual) {
        throw new Error('Pedido não encontrado');
      }
      
      const updateData: any = { status: newStatus };
      
      // Adicionar timestamps específicos baseado no status
      const now = new Date().toISOString();
      switch (newStatus) {
        case 'PREPARANDO':
          updateData.iniciado_preparo_em = now;
          break;
        case 'PRONTO':
          updateData.finalizado_preparo_em = now;
          break;
        case 'ENTREGUE':
          updateData.entregue_em = now;
          // Quando entregue, considerar pagamento realizado
          updateData.pago = true;
          updateData.valor_pago = pedidoAtual.total; // Usar o valor total do pedido atual
          break;
      }

      const { error } = await supabase
        .from('pedidos_unificados')
        .update(updateData)
        .eq('id', pedidoId);

      if (error) {
        throw error;
      }

      // Recarregar pedidos para aplicar nova ordenação
      await fetchPedidos();
      
      console.log(`Pedido ${pedidoId} atualizado para ${newStatus}${newStatus === 'ENTREGUE' ? ' e marcado como pago' : ''}`);
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      setError('Erro ao atualizar pedido');
    } finally {
      setUpdating(prev => ({ ...prev, [pedidoId]: false }));
    }
  };

  const getNextStatus = (currentStatus: string): string => {
    const statusFlow = {
      'PENDENTE': 'PREPARANDO',
      'PREPARANDO': 'PRONTO', 
      'PRONTO': 'ENTREGUE',
      'ENTREGUE': 'ENTREGUE'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || currentStatus;
  };

  const getStatusButtonText = (currentStatus: string): string => {
    const buttonText = {
      'PENDENTE': 'Iniciar Preparo',
      'PREPARANDO': 'Marcar Pronto',
      'PRONTO': 'Marcar Entregue',
      'ENTREGUE': 'Concluído'
    };
    return buttonText[currentStatus as keyof typeof buttonText] || 'Atualizar';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-yellow-500';
      case 'PREPARANDO':
        return 'bg-blue-500';
      case 'PRONTO':
        return 'bg-green-500';
      case 'ENTREGUE':
        return 'bg-gray-500';
      case 'CANCELADO':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const formatarItens = (itens: any[]): string => {
    if (!Array.isArray(itens) || itens.length === 0) {
      return 'Nenhum item';
    }
    
    return itens.map(item => 
      `${item.quantidade}x ${item.nome}${item.observacoes ? ` (${item.observacoes})` : ''}`
    ).join(', ');
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>Erro: {error}</p>
          <Button onClick={fetchPedidos} className="mt-2">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Calcular estatísticas
  const pedidosPendentes = pedidos.filter(p => p.status === 'PENDENTE').length;
  const pedidosPreparando = pedidos.filter(p => p.status === 'PREPARANDO').length;
  const pedidosProntos = pedidos.filter(p => p.status === 'PRONTO').length;
  const totalPedidos = pedidos.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gerenciamento de Pedidos Unificados</h1>
        <Button variant="outline" onClick={fetchPedidos}>
          Atualizar
        </Button>
      </div>

      {/* Resumo dos pedidos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-600">{pedidosPendentes}</p>
              </div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Preparando</p>
                <p className="text-2xl font-bold text-blue-600">{pedidosPreparando}</p>
              </div>
              <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prontos</p>
                <p className="text-2xl font-bold text-green-600">{pedidosProntos}</p>
              </div>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{totalPedidos}</p>
              </div>
              <div className="w-4 h-4 bg-gray-500 rounded-full"></div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Pedidos Ativos</h2>
        
        {pedidos.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhum pedido encontrado</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pedidos.map((pedido) => (
              <Card key={pedido.id} className="border-l-4" style={{borderLeftColor: getStatusColor(pedido.status || 'PENDENTE').replace('bg-', '#')}}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-base">
                          Pedido #{pedido.numero_pedido}
                        </h3>
                        <Badge className={getStatusColor(pedido.status || 'PENDENTE')} variant="secondary">
                          {formatarStatusPedido(pedido.status || 'PENDENTE')}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        {pedido.cliente_nome && (
                          <p><strong>Cliente:</strong> {pedido.cliente_nome}</p>
                        )}
                        {pedido.cliente_telefone && (
                          <p><strong>Telefone:</strong> {pedido.cliente_telefone}</p>
                        )}
                        {pedido.mesa_numero && (
                          <p><strong>Mesa:</strong> {pedido.mesa_numero}</p>
                        )}
                        <p><strong>Origem:</strong> {formatarOrigemPedido(pedido.origem)}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">
                        R$ {pedido.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(pedido.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Itens do pedido - mais compacto */}
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1">Itens:</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {formatarItens(pedido.itens)}
                    </p>
                  </div>
                  
                  {/* Observações - mais compacto */}
                  {(pedido.observacoes || pedido.observacoes_cozinha) && (
                    <div className="mb-3">
                      {pedido.observacoes && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Obs:</strong> {pedido.observacoes}
                        </p>
                      )}
                      {pedido.observacoes_cozinha && (
                        <p className="text-xs text-muted-foreground">
                          <strong>Cozinha:</strong> {pedido.observacoes_cozinha}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {/* Botões de ação - mais compactos */}
                  <div className="flex gap-2 pt-2 border-t">
                    {pedido.status !== 'ENTREGUE' && pedido.status !== 'CANCELADO' && (
                      <Button 
                        onClick={() => updatePedidoStatus(pedido.id, getNextStatus(pedido.status || 'PENDENTE'))}
                        disabled={updating[pedido.id]}
                        size="sm"
                        className="h-7 text-xs"
                      >
                        {updating[pedido.id] ? 'Atualizando...' : getStatusButtonText(pedido.status || 'PENDENTE')}
                      </Button>
                    )}
                    
                    {pedido.status !== 'CANCELADO' && pedido.status !== 'ENTREGUE' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => updatePedidoStatus(pedido.id, 'CANCELADO')}
                        disabled={updating[pedido.id]}
                        className="h-7 text-xs"
                      >
                        Cancelar
                      </Button>
                    )}
                    
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      Detalhes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}