import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { PedidoUnificado, formatarStatusPedido, formatarOrigemPedido } from "@/types/pedidos-unificados";
import { Truck, Utensils, Clock, ChefHat, CheckCircle, Package, XCircle, Printer, Eye } from "lucide-react";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<PedidoUnificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const [activeTypeTab, setActiveTypeTab] = useState<string>('todos');
  const [activeStatusTab, setActiveStatusTab] = useState<string>('todos');
  const [selectedPedido, setSelectedPedido] = useState<PedidoUnificado | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  useEffect(() => {
    fetchPedidos();
    setupPolling();
    
    // Cleanup polling on unmount
    return () => {
      // Polling será limpo automaticamente
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

  const setupPolling = () => {
    console.log('Configurando polling de pedidos...');
    
    // Verificar mudanças a cada 15 segundos (menos frequente)
    const interval = setInterval(() => {
      console.log('Verificando mudanças nos pedidos...');
      fetchPedidosSilently();
    }, 15000);

    return () => {
      console.log('Removendo polling de pedidos');
      clearInterval(interval);
    };
  };

  const fetchPedidosSilently = async () => {
    try {
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

      // Só atualizar se houver mudanças
      setPedidos(prevPedidos => {
        const hasChanges = JSON.stringify(prevPedidos) !== JSON.stringify(sortedPedidos);
        if (hasChanges) {
          console.log('Mudanças detectadas nos pedidos, atualizando...');
          return sortedPedidos;
        }
        return prevPedidos;
      });
    } catch (err) {
      console.error('Erro ao verificar pedidos silenciosamente:', err);
    }
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

  const openOrderModal = (pedido: PedidoUnificado) => {
    setSelectedPedido(pedido);
    setSelectedStatus(pedido.status || 'PENDENTE');
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedPedido(null);
    setSelectedStatus('');
  };

  const printComanda = () => {
    if (!selectedPedido) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const comandaHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comanda - Pedido #${selectedPedido.numero_pedido}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
            .order-info { margin-bottom: 20px; }
            .items { margin-bottom: 20px; }
            .item { margin-bottom: 10px; padding: 5px; border-bottom: 1px solid #eee; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            .observations { margin-top: 20px; padding: 10px; background-color: #f5f5f5; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>COMANDA</h1>
            <h2>Pedido #${selectedPedido.numero_pedido}</h2>
            <p>Data: ${new Date(selectedPedido.created_at).toLocaleString('pt-BR')}</p>
          </div>
          
          <div class="order-info">
            <p><strong>Cliente:</strong> ${selectedPedido.cliente_nome || 'N/A'}</p>
            <p><strong>Telefone:</strong> ${selectedPedido.cliente_telefone || 'N/A'}</p>
            <p><strong>Origem:</strong> ${formatarOrigemPedido(selectedPedido.origem)}</p>
            ${selectedPedido.mesa_numero ? `<p><strong>Mesa:</strong> ${selectedPedido.mesa_numero}</p>` : ''}
          </div>
          
          <div class="items">
            <h3>ITENS:</h3>
            ${selectedPedido.itens.map(item => `
              <div class="item">
                <strong>${item.quantidade}x ${item.nome}</strong>
                ${item.observacoes ? `<br><em>Obs: ${item.observacoes}</em>` : ''}
              </div>
            `).join('')}
          </div>
          
          ${selectedPedido.observacoes ? `
            <div class="observations">
              <h3>OBSERVAÇÕES:</h3>
              <p>${selectedPedido.observacoes}</p>
            </div>
          ` : ''}
          
          ${selectedPedido.observacoes_cozinha ? `
            <div class="observations">
              <h3>OBSERVAÇÕES COZINHA:</h3>
              <p>${selectedPedido.observacoes_cozinha}</p>
            </div>
          ` : ''}
          
          <div class="total">
            <p>TOTAL: R$ ${selectedPedido.total.toFixed(2)}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(comandaHTML);
    printWindow.document.close();
    printWindow.print();
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

  const renderPedidosList = (pedidosList: PedidoUnificado[]) => {
    if (pedidosList.length === 0) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Nenhum pedido encontrado</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4">
        {pedidosList.map((pedido) => (
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
                    onClick={() => openOrderModal(pedido)}
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
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => openOrderModal(pedido)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
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

  // Filtrar pedidos por tipo
  const pedidosDelivery = pedidos.filter(p => p.origem === 'DELIVERY');
  const pedidosMesa = pedidos.filter(p => p.origem === 'MESA');

  // Função para filtrar pedidos baseado nos filtros ativos
  const getFilteredPedidos = () => {
    let filtered = pedidos;

    // Filtrar por tipo
    if (activeTypeTab === 'delivery') {
      filtered = filtered.filter(p => p.origem === 'DELIVERY');
    } else if (activeTypeTab === 'mesa') {
      filtered = filtered.filter(p => p.origem === 'MESA');
    }

    // Filtrar por status
    if (activeStatusTab === 'pendentes') {
      filtered = filtered.filter(p => p.status === 'PENDENTE');
    } else if (activeStatusTab === 'preparando') {
      filtered = filtered.filter(p => p.status === 'PREPARANDO');
    } else if (activeStatusTab === 'prontos') {
      filtered = filtered.filter(p => p.status === 'PRONTO');
    } else if (activeStatusTab === 'entregues') {
      filtered = filtered.filter(p => p.status === 'ENTREGUE');
    } else if (activeStatusTab === 'cancelados') {
      filtered = filtered.filter(p => p.status === 'CANCELADO');
    }

    return filtered;
  };

  const filteredPedidos = getFilteredPedidos();

  // Calcular estatísticas gerais
  const pedidosPendentes = pedidos.filter(p => p.status === 'PENDENTE').length;
  const pedidosPreparando = pedidos.filter(p => p.status === 'PREPARANDO').length;
  const pedidosProntos = pedidos.filter(p => p.status === 'PRONTO').length;
  const pedidosEntregues = pedidos.filter(p => p.status === 'ENTREGUE').length;
  const pedidosCancelados = pedidos.filter(p => p.status === 'CANCELADO').length;
  const totalPedidos = pedidos.length;

  // Calcular estatísticas por tipo
  const deliveryPendentes = pedidosDelivery.filter(p => p.status === 'PENDENTE').length;
  const deliveryPreparando = pedidosDelivery.filter(p => p.status === 'PREPARANDO').length;
  const deliveryProntos = pedidosDelivery.filter(p => p.status === 'PRONTO').length;
  const totalDelivery = pedidosDelivery.length;

  const mesaPendentes = pedidosMesa.filter(p => p.status === 'PENDENTE').length;
  const mesaPreparando = pedidosMesa.filter(p => p.status === 'PREPARANDO').length;
  const mesaProntos = pedidosMesa.filter(p => p.status === 'PRONTO').length;
  const totalMesa = pedidosMesa.length;

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

      {/* Abas de tipo de pedidos */}
      <Tabs value={activeTypeTab} onValueChange={setActiveTypeTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todos" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Todos ({totalPedidos})
          </TabsTrigger>
          <TabsTrigger value="delivery" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Delivery ({totalDelivery})
          </TabsTrigger>
          <TabsTrigger value="mesa" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Mesa ({totalMesa})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Abas de status dos pedidos */}
      <Tabs value={activeStatusTab} onValueChange={setActiveStatusTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="todos" className="flex items-center gap-2">
            <Utensils className="h-4 w-4" />
            Todos os Status
          </TabsTrigger>
          <TabsTrigger value="pendentes" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes ({pedidosPendentes})
          </TabsTrigger>
          <TabsTrigger value="preparando" className="flex items-center gap-2">
            <ChefHat className="h-4 w-4" />
            Preparando ({pedidosPreparando})
          </TabsTrigger>
          <TabsTrigger value="prontos" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Prontos ({pedidosProntos})
          </TabsTrigger>
          <TabsTrigger value="entregues" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Entregues ({pedidosEntregues})
          </TabsTrigger>
          <TabsTrigger value="cancelados" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Cancelados ({pedidosCancelados})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {activeTypeTab === 'delivery' ? 'Pedidos de Delivery' : 
                 activeTypeTab === 'mesa' ? 'Pedidos de Mesa' : 'Todos os Pedidos'}
              </h2>
              <div className="text-sm text-muted-foreground">
                {filteredPedidos.length} pedido(s) encontrado(s)
              </div>
            </div>
            {renderPedidosList(filteredPedidos)}
          </div>
        </TabsContent>

        <TabsContent value="pendentes" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pedidos Pendentes
                {activeTypeTab === 'delivery' && ' (Delivery)'}
                {activeTypeTab === 'mesa' && ' (Mesa)'}
              </h2>
              <div className="text-sm text-muted-foreground">
                {filteredPedidos.length} pedido(s) pendente(s)
              </div>
            </div>
            {renderPedidosList(filteredPedidos)}
          </div>
        </TabsContent>

        <TabsContent value="preparando" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                Pedidos em Preparo
                {activeTypeTab === 'delivery' && ' (Delivery)'}
                {activeTypeTab === 'mesa' && ' (Mesa)'}
              </h2>
              <div className="text-sm text-muted-foreground">
                {filteredPedidos.length} pedido(s) em preparo
              </div>
            </div>
            {renderPedidosList(filteredPedidos)}
          </div>
        </TabsContent>

        <TabsContent value="prontos" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Pedidos Prontos
                {activeTypeTab === 'delivery' && ' (Delivery)'}
                {activeTypeTab === 'mesa' && ' (Mesa)'}
              </h2>
              <div className="text-sm text-muted-foreground">
                {filteredPedidos.length} pedido(s) pronto(s)
              </div>
            </div>
            {renderPedidosList(filteredPedidos)}
          </div>
        </TabsContent>

        <TabsContent value="entregues" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pedidos Entregues
                {activeTypeTab === 'delivery' && ' (Delivery)'}
                {activeTypeTab === 'mesa' && ' (Mesa)'}
              </h2>
              <div className="text-sm text-muted-foreground">
                {filteredPedidos.length} pedido(s) entregue(s)
              </div>
            </div>
            {renderPedidosList(filteredPedidos)}
          </div>
        </TabsContent>

        <TabsContent value="cancelados" className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Pedidos Cancelados
                {activeTypeTab === 'delivery' && ' (Delivery)'}
                {activeTypeTab === 'mesa' && ' (Mesa)'}
              </h2>
              <div className="text-sm text-muted-foreground">
                {filteredPedidos.length} pedido(s) cancelado(s)
              </div>
            </div>
            {renderPedidosList(filteredPedidos)}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal de detalhes do pedido */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Detalhes do Pedido #{selectedPedido?.numero_pedido}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPedido && (
            <div className="space-y-6">
              {/* Informações do pedido */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status Atual</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedPedido.status || 'PENDENTE')} variant="secondary">
                      {formatarStatusPedido(selectedPedido.status || 'PENDENTE')}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Data/Hora</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {new Date(selectedPedido.created_at).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Informações do cliente */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Cliente</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPedido.cliente_nome || 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Telefone</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedPedido.cliente_telefone || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Origem e mesa */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Origem</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatarOrigemPedido(selectedPedido.origem)}
                  </p>
                </div>
                {selectedPedido.mesa_numero && (
                  <div>
                    <Label className="text-sm font-medium">Mesa</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedPedido.mesa_numero}
                    </p>
                  </div>
                )}
              </div>

              {/* Itens do pedido */}
              <div>
                <Label className="text-sm font-medium">Itens do Pedido</Label>
                <div className="mt-2 space-y-2">
                  {selectedPedido.itens.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.quantidade}x {item.nome}</p>
                        {item.observacoes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Obs: {item.observacoes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {(item.preco * item.quantidade).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">R$ {item.preco.toFixed(2)} cada</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Observações */}
              {(selectedPedido.observacoes || selectedPedido.observacoes_cozinha) && (
                <div className="space-y-3">
                  {selectedPedido.observacoes && (
                    <div>
                      <Label className="text-sm font-medium">Observações do Cliente</Label>
                      <p className="text-sm text-muted-foreground mt-1 p-3 bg-gray-50 rounded-lg">
                        {selectedPedido.observacoes}
                      </p>
                    </div>
                  )}
                  {selectedPedido.observacoes_cozinha && (
                    <div>
                      <Label className="text-sm font-medium">Observações da Cozinha</Label>
                      <p className="text-sm text-muted-foreground mt-1 p-3 bg-yellow-50 rounded-lg">
                        {selectedPedido.observacoes_cozinha}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Total */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-medium">Total do Pedido</Label>
                  <p className="text-2xl font-bold text-primary">
                    R$ {selectedPedido.total.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Seleção de status */}
              {selectedPedido.status !== 'ENTREGUE' && selectedPedido.status !== 'CANCELADO' && (
                <div>
                  <Label className="text-sm font-medium">Alterar Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione o novo status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="PREPARANDO">Preparando</SelectItem>
                      <SelectItem value="PRONTO">Pronto</SelectItem>
                      <SelectItem value="ENTREGUE">Entregue</SelectItem>
                      <SelectItem value="CANCELADO">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Botões de ação */}
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={printComanda}
                  variant="outline"
                  className="flex-1"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir Comanda
                </Button>
                
                {selectedPedido.status !== 'ENTREGUE' && selectedPedido.status !== 'CANCELADO' && (
                  <Button 
                    onClick={() => {
                      if (selectedStatus && selectedStatus !== selectedPedido.status) {
                        updatePedidoStatus(selectedPedido.id, selectedStatus);
                        closeOrderModal();
                      }
                    }}
                    disabled={!selectedStatus || selectedStatus === selectedPedido.status}
                    className="flex-1"
                  >
                    Atualizar Status
                  </Button>
                )}
                
                <Button 
                  onClick={closeOrderModal}
                  variant="outline"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}