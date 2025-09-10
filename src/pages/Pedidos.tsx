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

      setPedidos(data || []);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const updatePedidoStatus = async (pedidoId: string, newStatus: string) => {
    try {
      setUpdating(prev => ({ ...prev, [pedidoId]: true }));
      
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
          break;
      }

      const { error } = await supabase
        .from('pedidos_unificados')
        .update(updateData)
        .eq('id', pedidoId);

      if (error) {
        throw error;
      }

      // Atualizar estado local
      setPedidos(prev => 
        prev.map(pedido => 
          pedido.id === pedidoId 
            ? { ...pedido, ...updateData }
            : pedido
        )
      );
      
      console.log(`Pedido ${pedidoId} atualizado para ${newStatus}`);
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
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido #{pedido.numero_pedido}
                      </CardTitle>
                      {pedido.cliente_nome && (
                        <p className="text-sm text-muted-foreground">
                          Cliente: {pedido.cliente_nome}
                        </p>
                      )}
                      {pedido.cliente_telefone && (
                        <p className="text-sm text-muted-foreground">
                          Telefone: {pedido.cliente_telefone}
                        </p>
                      )}
                      {pedido.mesa_numero && (
                        <p className="text-sm text-muted-foreground">
                          Mesa: {pedido.mesa_numero} ({pedido.mesa_etiqueta})
                        </p>
                      )}
                      {pedido.funcionario_nome && (
                        <p className="text-sm text-muted-foreground">
                          Atendente: {pedido.funcionario_nome}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(pedido.status || 'PENDENTE')}>
                        {formatarStatusPedido(pedido.status || 'PENDENTE')}
                      </Badge>
                      <p className="text-lg font-bold mt-1">
                        R$ {pedido.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-2">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Origem: {formatarOrigemPedido(pedido.origem)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Criado em: {new Date(pedido.created_at).toLocaleString('pt-BR')}
                      </p>
                    </div>

                    {/* Itens do pedido */}
                    <div>
                      <p className="text-sm font-medium">Itens:</p>
                      <p className="text-sm text-muted-foreground">
                        {formatarItens(pedido.itens)}
                      </p>
                    </div>
                    
                    {pedido.observacoes && (
                      <div>
                        <p className="text-sm font-medium">Observações:</p>
                        <p className="text-sm text-muted-foreground">{pedido.observacoes}</p>
                      </div>
                    )}

                    {pedido.observacoes_cozinha && (
                      <div>
                        <p className="text-sm font-medium">Obs. Cozinha:</p>
                        <p className="text-sm text-muted-foreground">{pedido.observacoes_cozinha}</p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      {pedido.status !== 'ENTREGUE' && pedido.status !== 'CANCELADO' && (
                        <Button 
                          onClick={() => updatePedidoStatus(pedido.id, getNextStatus(pedido.status || 'PENDENTE'))}
                          disabled={updating[pedido.id]}
                          size="sm"
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
                        >
                          Cancelar Pedido
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        Ver Detalhes
                      </Button>
                    </div>
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