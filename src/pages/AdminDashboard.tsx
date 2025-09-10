import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Calendar,
  BarChart3,
  MessageSquare,
  ChefHat,
  Table,
  Settings
} from "lucide-react";
import { Link } from "react-router-dom";

interface DashboardStats {
  totalPedidos: number;
  pedidosPendentes: number;
  pedidosConcluidos: number;
  pedidosCancelados: number;
  faturamentoHoje: number;
  clientesAtivos: number;
  mesasOcupadas: number;
  mesasLivres: number;
  funcionariosAtivos: number;
  itensCardapio: number;
  mesasData?: Array<{
    numero: number;
    status: string;
  }>;
}

import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import DashboardCharts from "@/components/DashboardCharts";

export default function AdminDashboard() {
  // Enable notifications for admin dashboard
  const { enableSound, disableSound, isSoundEnabled } = useRealtimeNotifications(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPedidos: 0,
    pedidosPendentes: 0,
    pedidosConcluidos: 0,
    pedidosCancelados: 0,
    faturamentoHoje: 0,
    clientesAtivos: 0,
    mesasOcupadas: 0,
    mesasLivres: 0,
    funcionariosAtivos: 0,
    itensCardapio: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentOrders();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch orders stats
      const today = new Date().toISOString().split('T')[0];
      
      const [
        { data: pedidos },
        { data: mesas },
        { data: customers },
        { data: funcionarios },
        { data: itens }
      ] = await Promise.all([
        supabase.from('pedidos').select('status, total, created_at, pago').gte('created_at', today),
        supabase.from('mesas').select('status, numero'),
        supabase.from('customers').select('id'),
        supabase.from('funcionarios').select('id, ativo').eq('ativo', true),
        supabase.from('itens_cardapio').select('id, ativo').eq('ativo', true)
      ]);

      if (pedidos) {
        const pendentes = pedidos.filter(p => p.status === 'PENDENTE').length;
        const concluidos = pedidos.filter(p => ['ENTREGUE', 'PRONTO'].includes(p.status)).length;
        const cancelados = pedidos.filter(p => p.status === 'CANCELADO').length;
        const faturamento = pedidos
          .filter(p => p.pago)
          .reduce((sum, p) => sum + (p.total || 0), 0);

        setStats(prev => ({
          ...prev,
          totalPedidos: pedidos.length,
          pedidosPendentes: pendentes,
          pedidosConcluidos: concluidos,
          pedidosCancelados: cancelados,
          faturamentoHoje: faturamento,
        }));
      }

      if (mesas) {
        const ocupadas = mesas.filter(m => m.status === 'OCUPADA').length;
        const livres = mesas.filter(m => m.status === 'LIVRE').length;
        
        setStats(prev => ({
          ...prev,
          mesasOcupadas: ocupadas,
          mesasLivres: livres,
          mesasData: mesas.map(m => ({ numero: m.numero || 0, status: m.status })),
        }));
      }

      if (customers) {
        setStats(prev => ({ ...prev, clientesAtivos: customers.length }));
      }

      if (funcionarios) {
        setStats(prev => ({ ...prev, funcionariosAtivos: funcionarios.length }));
      }

      if (itens) {
        setStats(prev => ({ ...prev, itensCardapio: itens.length }));
      }

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentOrders = async () => {
    try {
      const { data } = await supabase
        .from('pedidos')
        .select('id, cliente_nome, status, total, created_at, origem, pago')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) {
        setRecentOrders(data);
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'PREPARANDO':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'PRONTO':
        return 'bg-success/10 text-success border-success/20';
      case 'ENTREGUE':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'CANCELADO':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Dashboard Administrativo
          </h1>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Dashboard Administrativo
        </h1>
        <p className="text-muted-foreground">
          Controle total do seu negócio - Visão completa do administrador
        </p>
      </div>

      {/* Stats Cards - Admin Complete View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Pedidos Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stats.totalPedidos}</div>
            <div className="flex gap-1 mt-1">
              <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                {stats.pedidosPendentes} pendentes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Faturado Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-800">
              {formatCurrency(stats.faturamentoHoje)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {stats.pedidosConcluidos} finalizados
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Mesas</CardTitle>
            <Table className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{stats.mesasOcupadas}</div>
            <p className="text-xs text-purple-600 mt-1">
              de {stats.mesasOcupadas + stats.mesasLivres} ocupadas
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Funcionários</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{stats.funcionariosAtivos}</div>
            <p className="text-xs text-orange-600 mt-1">ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-700">Cardápio</CardTitle>
            <ChefHat className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-800">{stats.itensCardapio}</div>
            <p className="text-xs text-yellow-600 mt-1">itens ativos</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Clientes</CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-800">{stats.clientesAtivos}</div>
            <p className="text-xs text-teal-600 mt-1">cadastrados</p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions Grid - Removido porque agora está no menu lateral */}

      {/* Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <Card className="border-border shadow-elegant lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Pedidos Recentes
            </CardTitle>
            <CardDescription>
              Últimos 5 pedidos realizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">
                      {order.cliente_nome || 'Cliente não informado'}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {order.origem}
                      </span>
                      {order.pago && (
                        <Badge className="text-xs bg-success/10 text-success border-success/20">
                          PAGO
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-primary">
                      {formatCurrency(order.total || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
              {recentOrders.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Nenhum pedido recente
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Admin Actions */}
        <Card className="border-border shadow-elegant">
          <CardHeader>
            <CardTitle>Menu Principal do Sistema</CardTitle>
            <CardDescription>
              Todas as funcionalidades administrativas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <Button asChild variant="outline" className="justify-start h-12">
                <Link to="/pedidos">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Gerenciar Pedidos</p>
                    <p className="text-xs text-muted-foreground">{stats.pedidosPendentes} pendentes</p>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-12">
                <Link to="/mesas">
                  <Table className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Controle de Mesas</p>
                    <p className="text-xs text-muted-foreground">{stats.mesasOcupadas} ocupadas</p>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-12">
                <Link to="/cardapio">
                  <ChefHat className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Gestão Total do Cardápio</p>
                    <p className="text-xs text-muted-foreground">{stats.itensCardapio} itens</p>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-12">
                <Link to="/funcionarios">
                  <Users className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Funcionários</p>
                    <p className="text-xs text-muted-foreground">{stats.funcionariosAtivos} ativos</p>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-12">
                <Link to="/clientes">
                  <Users className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Clientes</p>
                    <p className="text-xs text-muted-foreground">{stats.clientesAtivos} cadastrados</p>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-12">
                <Link to="/remarketing">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Contatos para Remarketing</p>
                    <p className="text-xs text-muted-foreground">Campanhas de reconquista</p>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-12">
                <Link to="/relatorios">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Relatórios Financeiros</p>
                    <p className="text-xs text-muted-foreground">Análise completa</p>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-12">
                <Link to="/financeiro">
                  <DollarSign className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Financeiro</p>
                    <p className="text-xs text-muted-foreground">Controle financeiro</p>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-12">
                <Link to="/configuracoes">
                  <Settings className="h-4 w-4 mr-2" />
                  <div className="text-left">
                    <p className="font-medium">Configurações</p>
                    <p className="text-xs text-muted-foreground">Sistema geral</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Management Section - Admin Complete Control */}
      <Card className="border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5 text-primary" />
            Controle Completo de Mesas
          </CardTitle>
          <CardDescription>
            Status em tempo real de todas as mesas do restaurante
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {Array.from({ length: 20 }, (_, i) => {
              const mesaNumber = i + 1;
              const mesa = stats.mesasData?.find(m => m.numero === mesaNumber);
              const status = mesa?.status || 'LIVRE';
              
              return (
                <div
                  key={mesaNumber}
                  className={`
                    p-3 rounded-lg border text-center cursor-pointer transition-all hover:shadow-md
                    ${status === 'LIVRE' ? 'bg-success/10 border-success/20 text-success' :
                      status === 'OCUPADA' ? 'bg-primary/10 border-primary/20 text-primary' :
                      status === 'RESERVADA' ? 'bg-purple-500/10 border-purple-500/20 text-purple-600' :
                      'bg-blue-500/10 border-blue-500/20 text-blue-600'
                    }
                  `}
                >
                  <div className="text-sm font-bold">M{mesaNumber}</div>
                  <div className="text-xs">{status}</div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/mesas">Gerenciar Todas as Mesas</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}