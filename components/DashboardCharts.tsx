import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  XCircle,
  Clock,
  Star
} from "lucide-react";

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
  averageTicket: number;
}

interface OrderStats {
  status: string;
  count: number;
  percentage: number;
}

interface TopProduct {
  nome: string;
  quantity: number;
  revenue: number;
}

export default function DashboardCharts() {
  const [dailyRevenue, setDailyRevenue] = useState<DailyRevenue[]>([]);
  const [orderStats, setOrderStats] = useState<OrderStats[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageTicket: 0,
    cancelledOrders: 0,
    growthRate: 0
  });
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [period]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDailyRevenue(),
        fetchOrderStats(),
        fetchTopProducts(),
        fetchTotalStats()
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyRevenue = async () => {
    try {
      const daysAgo = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('pedidos')
        .select('created_at, total, status')
        .gte('created_at', startDate.toISOString())
        .eq('pago', true)
        .order('created_at');

      if (error) throw error;

      // Group by date
      const revenueByDate: { [key: string]: { revenue: number; orders: number } } = {};
      
      data?.forEach(order => {
        const date = new Date(order.created_at).toISOString().split('T')[0];
        if (!revenueByDate[date]) {
          revenueByDate[date] = { revenue: 0, orders: 0 };
        }
        revenueByDate[date].revenue += order.total;
        revenueByDate[date].orders += 1;
      });

      const revenueData = Object.entries(revenueByDate).map(([date, data]) => ({
        date: new Date(date).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        revenue: data.revenue,
        orders: data.orders,
        averageTicket: data.revenue / data.orders
      }));

      setDailyRevenue(revenueData);
    } catch (error) {
      console.error('Error fetching daily revenue:', error);
    }
  };

  const fetchOrderStats = async () => {
    try {
      const daysAgo = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('pedidos')
        .select('status')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const statusCounts: { [key: string]: number } = {};
      let total = 0;

      data?.forEach(order => {
        statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        total++;
      });

      const stats = Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
        percentage: (count / total) * 100
      }));

      setOrderStats(stats);
    } catch (error) {
      console.error('Error fetching order stats:', error);
    }
  };

  const fetchTopProducts = async () => {
    try {
      const daysAgo = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('pedidos_itens')
        .select(`
          quantidade,
          preco_unitario,
          itens_cardapio (nome),
          pedido_id,
          pedidos!inner (created_at, pago)
        `)
        .gte('pedidos.created_at', startDate.toISOString())
        .eq('pedidos.pago', true);

      if (error) throw error;

      const productStats: { [key: string]: { quantity: number; revenue: number } } = {};

      data?.forEach(item => {
        const nome = item.itens_cardapio?.nome || 'Produto Desconhecido';
        if (!productStats[nome]) {
          productStats[nome] = { quantity: 0, revenue: 0 };
        }
        productStats[nome].quantity += item.quantidade;
        productStats[nome].revenue += item.quantidade * item.preco_unitario;
      });

      const topProductsData = Object.entries(productStats)
        .map(([nome, stats]) => ({ nome, ...stats }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      setTopProducts(topProductsData);
    } catch (error) {
      console.error('Error fetching top products:', error);
    }
  };

  const fetchTotalStats = async () => {
    try {
      const daysAgo = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      const { data, error } = await supabase
        .from('pedidos')
        .select('total, status, pago, created_at')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const paidOrders = data?.filter(order => order.pago) || [];
      const totalRevenue = paidOrders.reduce((sum, order) => sum + order.total, 0);
      const totalOrders = data?.length || 0;
      const cancelledOrders = data?.filter(order => order.status === 'CANCELADO').length || 0;
      const averageTicket = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;

      // Calculate growth rate (compare with previous period)
      const previousPeriodStart = new Date(startDate);
      previousPeriodStart.setDate(previousPeriodStart.getDate() - daysAgo);
      
      const { data: previousData } = await supabase
        .from('pedidos')
        .select('total')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', startDate.toISOString())
        .eq('pago', true);

      const previousRevenue = previousData?.reduce((sum, order) => sum + order.total, 0) || 0;
      const growthRate = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      setTotalStats({
        totalRevenue,
        totalOrders,
        averageTicket,
        cancelledOrders,
        growthRate
      });
    } catch (error) {
      console.error('Error fetching total stats:', error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'PENDENTE': '#f59e0b',
      'PREPARANDO': '#3b82f6',
      'PRONTO': '#10b981',
      'ENTREGUE': '#22c55e',
      'CANCELADO': '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'CANCELADO':
        return <XCircle className="h-4 w-4" />;
      case 'PENDENTE':
        return <Clock className="h-4 w-4" />;
      case 'PREPARANDO':
        return <Clock className="h-4 w-4" />;
      default:
        return <ShoppingCart className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Period Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Dashboard Analítico
          </h2>
          <p className="text-muted-foreground">
            Visão completa do desempenho do seu negócio
          </p>
        </div>
        
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="15">Últimos 15 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Faturamento Total</p>
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(totalStats.totalRevenue)}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  {totalStats.growthRate >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-success" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-destructive" />
                  )}
                  <span className={`text-sm font-medium ${
                    totalStats.growthRate >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {totalStats.growthRate.toFixed(1)}% vs período anterior
                  </span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
                <p className="text-2xl font-bold text-blue-600">{totalStats.totalOrders}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {Math.round(totalStats.totalOrders / parseInt(period))} pedidos/dia
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ticket Médio</p>
                <p className="text-2xl font-bold text-success">
                  {formatCurrency(totalStats.averageTicket)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Por pedido pago
                </p>
              </div>
              <Star className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pedidos Cancelados</p>
                <p className="text-2xl font-bold text-destructive">{totalStats.cancelledOrders}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {totalStats.totalOrders > 0 
                    ? `${((totalStats.cancelledOrders / totalStats.totalOrders) * 100).toFixed(1)}% dos pedidos`
                    : '0% dos pedidos'
                  }
                </p>
              </div>
              <XCircle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Faturamento Diário</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#8884d8" 
                strokeWidth={3}
                dot={{ fill: '#8884d8' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Status dos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStats}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ status, percentage }) => `${status}: ${percentage.toFixed(1)}%`}
                >
                  {orderStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="space-y-2 mt-4">
              {orderStats.map((stat) => (
                <div key={stat.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(stat.status)}
                    <span className="text-sm">{stat.status}</span>
                  </div>
                  <Badge style={{ backgroundColor: getStatusColor(stat.status), color: 'white' }}>
                    {stat.count} ({stat.percentage.toFixed(1)}%)
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Mais Vendidos</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topProducts} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => value.toString()} />
                <YAxis type="category" dataKey="nome" width={120} />
                <Tooltip formatter={(value, name) => [
                  name === 'quantity' ? `${value} vendidos` : formatCurrency(Number(value)),
                  name === 'quantity' ? 'Quantidade' : 'Receita'
                ]} />
                <Bar dataKey="quantity" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}