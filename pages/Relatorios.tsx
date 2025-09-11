import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Download,
  Users,
  ShoppingCart,
  Clock
} from "lucide-react";

interface RevenueData {
  date: string;
  total_revenue: number;
  total_orders: number;
  average_ticket: number;
}

interface ProductStats {
  nome: string;
  quantidade_vendida: number;
  receita_total: number;
}

export default function Relatorios() {
  const [dailyRevenue, setDailyRevenue] = useState<RevenueData[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageTicket: 0,
    bestDay: '',
    bestDayRevenue: 0
  });
  const [topProducts, setTopProducts] = useState<ProductStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Buscar dados do mês atual
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      
      // Buscar pedidos do mês atual da tabela unificada
      const { data: ordersData } = await supabase
        .from('pedidos_unificados')
        .select('total, created_at, pago, status')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())
        .not('status', 'eq', 'CANCELADO')
        .order('created_at', { ascending: false });

      if (ordersData) {
        // Calcular receita diária do mês atual
        const dailyRevenueMap = new Map<string, { total_revenue: number; total_orders: number }>();
        
        ordersData.forEach(order => {
          const date = order.created_at.split('T')[0];
          const isPaid = order.pago === true;
          
          if (!dailyRevenueMap.has(date)) {
            dailyRevenueMap.set(date, { total_revenue: 0, total_orders: 0 });
          }
          
          const dayData = dailyRevenueMap.get(date)!;
          dayData.total_orders += 1;
          if (isPaid) {
            dayData.total_revenue += order.total || 0;
          }
        });

        // Converter para array e ordenar
        const dailyRevenueArray = Array.from(dailyRevenueMap.entries())
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setDailyRevenue(dailyRevenueArray);
        
        // Calcular estatísticas do mês atual
        const paidOrders = ordersData.filter(order => order.pago === true);
        const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = ordersData.length;
        const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        const bestDay = dailyRevenueArray.reduce((best, day) => 
          day.total_revenue > best.total_revenue ? day : best
        , dailyRevenueArray[0] || { total_revenue: 0, date: '' });

        setMonthlyStats({
          totalRevenue,
          totalOrders,
          averageTicket,
          bestDay: bestDay.date,
          bestDayRevenue: bestDay.total_revenue
        });
      }

      // Buscar produtos mais vendidos do mês atual
      const { data: productsData } = await supabase
        .from('pedidos_unificados')
        .select('itens, total, created_at')
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString())
        .not('status', 'eq', 'CANCELADO');

      if (productsData) {
        const productMap = new Map<string, ProductStats>();
        
        productsData.forEach(order => {
          if (order.itens && Array.isArray(order.itens)) {
            order.itens.forEach((item: any) => {
              const productName = item.nome || 'Produto sem nome';
              const existing = productMap.get(productName) || {
                nome: productName,
                quantidade_vendida: 0,
                receita_total: 0
              };
              
              existing.quantidade_vendida += item.quantidade || 0;
              existing.receita_total += (item.quantidade || 0) * (item.preco_unitario || 0);
              productMap.set(productName, existing);
            });
          }
        });

        const sortedProducts = Array.from(productMap.values())
          .sort((a, b) => b.quantidade_vendida - a.quantidade_vendida)
          .slice(0, 10);
        
        setTopProducts(sortedProducts);
      }

    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const exportReport = () => {
    // Implementar exportação para CSV/PDF
    console.log('Exportando relatório...');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Relatórios Financeiros</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
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
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Relatórios Financeiros
          </h1>
          <p className="text-muted-foreground">
            Análise completa do desempenho do seu negócio
          </p>
        </div>
        <Button onClick={exportReport} className="gradient-primary">
          <Download className="h-4 w-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* Resumo Mensal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Faturamento (Mês Atual)</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">
              {formatCurrency(monthlyStats.totalRevenue)}
            </div>
            <p className="text-xs text-green-600 mt-1">
              {monthlyStats.totalOrders} pedidos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">
              {formatCurrency(monthlyStats.averageTicket)}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Por pedido
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Melhor Dia</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">
              {formatCurrency(monthlyStats.bestDayRevenue)}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              {formatDate(monthlyStats.bestDay)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Total de Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">
              {monthlyStats.totalOrders}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Mês atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Receita Diária */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Receita Diária (Mês Atual)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dailyRevenue.slice(0, 10).map((day, index) => (
              <div key={day.date} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="space-y-1">
                  <p className="font-medium">{formatDate(day.date)}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ShoppingCart className="h-3 w-3" />
                      <span>{day.total_orders} pedidos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>Ticket: {formatCurrency(day.average_ticket)}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(day.total_revenue)}
                  </p>
                  <Badge variant={index < 3 ? "default" : "secondary"} className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Produtos Mais Vendidos */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Produtos Mais Vendidos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.nome} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="space-y-1">
                  <p className="font-medium">{product.nome}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.quantidade_vendida} unidades vendidas
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(product.receita_total)}
                  </p>
                  <Badge variant={index < 3 ? "default" : "secondary"} className="text-xs">
                    #{index + 1}
                  </Badge>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Nenhum produto vendido no período
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}