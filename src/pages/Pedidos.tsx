import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { PedidoUnificado, formatarStatusPedido, formatarOrigemPedido } from "@/types/pedidos-unificados";
import { 
  Truck, 
  Utensils, 
  Clock, 
  ChefHat, 
  CheckCircle, 
  Package, 
  XCircle, 
  Printer, 
  Eye, 
  Search, 
  Calendar, 
  MapPin, 
  Edit, 
  Plus,
  Settings,
  Download,
  Filter,
  MoreHorizontal
} from "lucide-react";

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<PedidoUnificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<{ [key: string]: boolean }>({});
  const [activeTab, setActiveTab] = useState<string>('aberto');
  const [selectedPedido, setSelectedPedido] = useState<PedidoUnificado | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  
  // Estados para filtros e busca
  const [searchTerm, setSearchTerm] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [selectedPedidos, setSelectedPedidos] = useState<string[]>([]);

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

  // Função para filtrar pedidos baseado na aba ativa
  const getFilteredPedidosByTab = () => {
    let filtered = pedidos;

    switch (activeTab) {
      case 'aberto':
        filtered = filtered.filter(p => p.status === 'PENDENTE' || p.status === 'PREPARANDO');
        break;
      case 'agendados':
        // Aqui você pode implementar lógica para pedidos agendados
        filtered = filtered.filter(p => p.status === 'PENDENTE');
        break;
      case 'finalizados':
        filtered = filtered.filter(p => p.status === 'ENTREGUE');
        break;
      case 'cancelados':
        filtered = filtered.filter(p => p.status === 'CANCELADO');
        break;
      default:
        break;
    }

    // Aplicar filtros de busca
    if (searchTerm) {
      filtered = filtered.filter(p => 
        p.cliente_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cliente_telefone?.includes(searchTerm) ||
        p.numero_pedido?.toString().includes(searchTerm)
      );
    }

    return filtered;
  };

  // Função para calcular estatísticas
  const getStats = () => {
    const total = pedidos.length;
    const emPreparacao = pedidos.filter(p => p.status === 'PREPARANDO').length;
    const emEntrega = pedidos.filter(p => p.status === 'PRONTO').length;
    const novos = pedidos.filter(p => p.status === 'PENDENTE').length;

    return { total, emPreparacao, emEntrega, novos };
  };

  // Função para formatar tempo decorrido
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const orderDate = new Date(date);
    const diffInHours = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60));
      return `${diffInMinutes} min atrás`;
    }
    return `${diffInHours} hrs atrás`;
  };

  // Função para selecionar/deselecionar pedidos
  const togglePedidoSelection = (pedidoId: string) => {
    setSelectedPedidos(prev => 
      prev.includes(pedidoId) 
        ? prev.filter(id => id !== pedidoId)
        : [...prev, pedidoId]
    );
  };

  // Função para selecionar todos os pedidos
  const toggleAllPedidos = () => {
    const filteredPedidos = getFilteredPedidosByTab();
    const allIds = filteredPedidos.map(p => p.id);
    
    if (selectedPedidos.length === allIds.length) {
      setSelectedPedidos([]);
    } else {
      setSelectedPedidos(allIds);
    }
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
            body { 
              font-family: 'Courier New', monospace; 
              margin: 0; 
              padding: 20px; 
              font-size: 14px;
              line-height: 1.4;
              color: #000;
              background: white;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #000; 
              padding-bottom: 15px;
            }
            .logo {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .subtitle {
              font-size: 12px;
              margin-bottom: 10px;
            }
            .order-number {
              font-size: 18px;
              font-weight: bold;
              margin: 10px 0;
            }
            .order-date {
              font-size: 12px;
              margin-bottom: 15px;
            }
            .section {
              margin-bottom: 15px;
            }
            .section-title {
              font-weight: bold;
              margin-bottom: 8px;
              text-transform: uppercase;
            }
            .item {
              margin-bottom: 8px;
              padding-bottom: 5px;
            }
            .item-name {
              font-weight: bold;
              margin-bottom: 2px;
            }
            .item-details {
              font-size: 12px;
              margin-left: 10px;
              color: #666;
            }
            .item-obs {
              font-style: italic;
              color: #333;
              margin-top: 2px;
            }
            .separator {
              border-top: 1px dashed #000;
              margin: 10px 0;
            }
            .price-summary {
              margin-top: 15px;
            }
            .price-line {
              display: flex;
              justify-content: space-between;
              margin-bottom: 3px;
            }
            .total-line {
              font-weight: bold;
              font-size: 16px;
              border-top: 1px solid #000;
              padding-top: 5px;
              margin-top: 10px;
            }
            .observations {
              margin-top: 15px;
              padding: 10px;
              background-color: #f9f9f9;
              border: 1px solid #ddd;
            }
            .delivery-info {
              margin-top: 15px;
              padding: 10px;
              background-color: #f0f0f0;
              border: 1px solid #ccc;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 10px;
              color: #666;
            }
            @media print { 
              body { margin: 0; padding: 15px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🍔 VENEZA'S LANCHE</div>
            <div class="subtitle">LANCHONETE</div>
            <div class="order-number">Pedido #${selectedPedido.numero_pedido}</div>
            <div class="order-date">Realizado em: ${new Date(selectedPedido.created_at).toLocaleDateString('pt-BR')} - ${new Date(selectedPedido.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
          
          <div class="section">
            <div class="section-title">Itens do Pedido</div>
            ${selectedPedido.itens && Array.isArray(selectedPedido.itens) ? selectedPedido.itens.map((item, index) => `
              <div class="item">
                <div class="item-name">${item.quantidade || 1}x ${item.nome || 'Item'}</div>
                <div class="item-details">R$ ${(item.preco || 0).toFixed(2)} cada</div>
                ${item.observacoes ? `<div class="item-obs">Obs: ${item.observacoes}</div>` : ''}
                ${index < selectedPedido.itens.length - 1 ? '<div class="separator"></div>' : ''}
              </div>
            `).join('') : '<p>Nenhum item encontrado</p>'}
          </div>
          
          <div class="price-summary">
            <div class="price-line">
              <span>Valor dos produtos:</span>
              <span>R$ ${selectedPedido.total.toFixed(2)}</span>
            </div>
            <div class="total-line">
              <span>TOTAL:</span>
              <span>R$ ${selectedPedido.total.toFixed(2)}</span>
            </div>
          </div>
          
          ${selectedPedido.observacoes ? `
            <div class="observations">
              <div class="section-title">Observações</div>
              <p>${selectedPedido.observacoes}</p>
            </div>
          ` : ''}
          
          ${selectedPedido.observacoes_cozinha ? `
            <div class="observations">
              <div class="section-title">Observações da Cozinha</div>
              <p>${selectedPedido.observacoes_cozinha}</p>
            </div>
          ` : ''}
          
          <div class="delivery-info">
            <div class="section-title">${formatarOrigemPedido(selectedPedido.origem)}</div>
            <p><strong>Cliente:</strong> ${selectedPedido.cliente_nome || 'N/A'}</p>
            <p><strong>Telefone:</strong> ${selectedPedido.cliente_telefone || 'N/A'}</p>
            ${selectedPedido.mesa_numero ? `<p><strong>Mesa:</strong> ${selectedPedido.mesa_numero}</p>` : ''}
          </div>
          
          <div class="footer">
            <p>Comanda gerada automaticamente</p>
            <p>Veneza's Lanche - Sistema de Gestão</p>
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


  const stats = getStats();
  const filteredPedidos = getFilteredPedidosByTab();

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

  return (
    <div className="p-6 space-y-6">
      {/* Abas principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="aberto" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Em aberto
          </TabsTrigger>
          <TabsTrigger value="agendados" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Agendados
          </TabsTrigger>
          <TabsTrigger value="finalizados" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Finalizados
          </TabsTrigger>
          <TabsTrigger value="cancelados" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Cancelados
          </TabsTrigger>
        </TabsList>

        {/* Cards de status */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="bg-gray-800 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm opacity-80">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-500 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm opacity-80">Em Preparação</p>
                <p className="text-2xl font-bold">{stats.emPreparacao}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-500 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm opacity-80">Em Entrega</p>
                <p className="text-2xl font-bold">{stats.emEntrega}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-blue-500 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-sm opacity-80">Novos</p>
                <p className="text-2xl font-bold">{stats.novos}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Novo Pedido
          </Button>
          <Button className="bg-orange-600 hover:bg-orange-700 text-white">
            <Utensils className="h-4 w-4 mr-2" />
            Novo Pedido Balcão
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <CheckCircle className="h-4 w-4 mr-2" />
            Finalizar Pedidos
          </Button>
        </div>

        {/* Seção de busca e filtros */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Busque por nome ou telefone do cliente ou por código"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="date"
                placeholder="busque pelo dia"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="time"
                placeholder="hora inicio"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="time"
                placeholder="hora fim"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Controles da tabela */}
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Configurar Colunas
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
            
            <div className="text-sm text-gray-500">
              Arraste aqui o cabeçalho de uma coluna para agrupar por esta coluna
            </div>
          </div>
        </div>

        {/* Tabela de pedidos */}
        <TabsContent value={activeTab} className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedPedidos.length === filteredPedidos.length && filteredPedidos.length > 0}
                        onCheckedChange={toggleAllPedidos}
                      />
                    </TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Realizado</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tx. Entrega</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Pagamento</TableHead>
                    <TableHead>Pago</TableHead>
                    <TableHead>Endereço Entrega</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPedidos.map((pedido) => (
                    <TableRow key={pedido.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedPedidos.includes(pedido.id)}
                          onCheckedChange={() => togglePedidoSelection(pedido.id)}
                        />
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{pedido.numero_pedido}</p>
                          <Badge variant="outline" className="text-xs">
                            {formatarOrigemPedido(pedido.origem)}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          <p className="text-sm">
                            {new Date(pedido.created_at).toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            {getTimeAgo(pedido.created_at)}
                          </Badge>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div>
                          <p className="font-medium">{pedido.cliente_nome || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{pedido.cliente_telefone || 'N/A'}</p>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <p className="text-sm">R$ 0,00</p>
                      </TableCell>
                      
                      <TableCell>
                        <p className="text-sm font-medium">R$ {pedido.total.toFixed(2)}</p>
                      </TableCell>
                      
                      <TableCell>
                        <p className="text-sm">Pix Online ***0316</p>
                      </TableCell>
                      
                      <TableCell>
                        {pedido.pago ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="text-sm line-clamp-2">
                            {pedido.endereco_entrega || 'Endereço não informado'}
                          </p>
                          <Button variant="ghost" size="sm" className="h-6 px-2 mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            Localização
                          </Button>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex gap-1">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                pedido.status === 'PENDENTE' ? 'bg-blue-100 text-blue-800' :
                                pedido.status === 'PREPARANDO' ? 'bg-orange-100 text-orange-800' :
                                pedido.status === 'PRONTO' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {formatarStatusPedido(pedido.status || 'PENDENTE')}
                            </Badge>
                          </div>
                          
                          {pedido.status === 'PREPARANDO' && (
                            <Button size="sm" className="h-6 text-xs">
                              <Truck className="h-3 w-3 mr-1" />
                              Despachar
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
          
          {selectedPedido && selectedPedido.itens && (
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
                  {selectedPedido.itens && Array.isArray(selectedPedido.itens) ? selectedPedido.itens.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{item.quantidade || 1}x {item.nome || 'Item'}</p>
                        {item.observacoes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            Obs: {item.observacoes}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium">R$ {((item.preco || 0) * (item.quantidade || 1)).toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">R$ {(item.preco || 0).toFixed(2)} cada</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-sm text-muted-foreground">Nenhum item encontrado</p>
                  )}
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