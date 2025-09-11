import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Users, 
  DollarSign, 
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

interface DashboardStats {
  totalPedidos: number;
  pedidosPendentes: number;
  pedidosConcluidos: number;
  pedidosCancelados: number;
  faturamentoHoje: number;
  clientesAtivos: number;
  mesasOcupadas: number;
  mesasLivres: number;
  mesasData?: Array<{
    numero: number;
    status: string;
  }>;
}

export default function Dashboard() {
  // Redirect admin users to AdminDashboard
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    const checkUserRole = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('papel')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserRole(profile.papel);
          // Admin users should be redirected to AdminDashboard
          if (profile.papel === 'ADMIN') {
            window.location.href = '/admin-dashboard';
            return;
          }
        }
      }
    };

    checkUserRole();
  }, []);
  const [stats, setStats] = useState<DashboardStats>({
    totalPedidos: 0,
    pedidosPendentes: 0,
    pedidosConcluidos: 0,
    pedidosCancelados: 0,
    faturamentoHoje: 0,
    clientesAtivos: 0,
    mesasOcupadas: 0,
    mesasLivres: 0,
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
      
      const { data: pedidos } = await supabase
        .from('pedidos')
        .select('status, total, created_at')
        .gte('created_at', today);

      const { data: mesas } = await supabase
        .from('mesas')
        .select('status, numero');

      const { data: customers } = await supabase
        .from('customers')
        .select('id');

      if (pedidos) {
        const pendentes = pedidos.filter(p => p.status === 'PENDENTE').length;
        const concluidos = pedidos.filter(p => p.status === 'CONCLUIDO').length;
        const cancelados = pedidos.filter(p => p.status === 'CANCELADO').length;
        const faturamento = pedidos
          .filter(p => p.status === 'CONCLUIDO')
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
        setStats(prev => ({
          ...prev,
          clientesAtivos: customers.length,
        }));
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
        .select('id, cliente_nome, status, total, created_at, origem')
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
      case 'CONCLUIDO':
        return 'bg-success/10 text-success border-success/20';
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
            Dashboard
          </h1>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
          Dashboard
        </h1>
        <p className="text-muted-foreground">
          Visão geral do seu negócio em tempo real
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Pedidos Hoje</CardTitle>
            <ShoppingCart className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{stats.totalPedidos}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/20">
                {stats.pedidosPendentes} pendentes
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elegant animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Hoje</CardTitle>
            <DollarSign className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(stats.faturamentoHoje)}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.pedidosConcluidos} pedidos concluídos
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elegant animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesas</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.mesasOcupadas}</div>
            <p className="text-xs text-muted-foreground">
              ocupadas de {stats.mesasOcupadas + stats.mesasLivres} mesas
            </p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-elegant animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.clientesAtivos}</div>
            <p className="text-xs text-muted-foreground">
              cadastrados no sistema
            </p>
          </CardContent>
        </Card>
      </div>

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

        {/* Quick Actions */}
        <Card className="border-border shadow-elegant">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acesso rápido às principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-3">
              <button className="p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-left space-y-2">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <p className="font-medium text-sm">Pedidos</p>
                  <p className="text-xs text-muted-foreground">Gerenciar pedidos</p>
                </div>
              </button>
              
              <button className="p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-left space-y-2">
                <Users className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Mesas</p>
                  <p className="text-xs text-muted-foreground">Controle de mesas</p>
                </div>
              </button>
              
              <button className="p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-left space-y-2">
                <DollarSign className="h-5 w-5 text-accent" />
                <div>
                  <p className="font-medium text-sm">Financeiro</p>
                  <p className="text-xs text-muted-foreground">Relatórios</p>
                </div>
              </button>
              
              <button className="p-4 rounded-lg border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-left space-y-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                <div>
                  <p className="font-medium text-sm">Clientes</p>
                  <p className="text-xs text-muted-foreground">Remarketing</p>
                </div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table Management Section - Admin Only */}
      <Card className="border-border shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Controle de Mesas (1-20)
          </CardTitle>
          <CardDescription>
            Status em tempo real das mesas do restaurante
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
          <div className="flex justify-center mt-4">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
              Gerenciar Mesas
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}