import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  PiggyBank,
  Plus,
  Edit,
  Trash2,
  Calculator,
  Calendar,
  Filter,
  RefreshCw,
  Printer,
  Download,
  FileText,
  BarChart3,
  PieChart,
  Receipt,
  ShoppingCart
} from "lucide-react";

interface PaymentMethod {
  id: string;
  nome: string;
  fee_type: string;
  fee_value: number;
  ativo: boolean;
}

interface PaymentMethodData {
  total: number;
  count: number;
  percentage: number;
}

interface FinancialSummary {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  paymentMethodsBreakdown: {
    dinheiro: PaymentMethodData;
    debito: PaymentMethodData;
    credito: PaymentMethodData;
    vr: PaymentMethodData;
    sodexo: PaymentMethodData;
    ticket: PaymentMethodData;
    alelo: PaymentMethodData;
    outros: PaymentMethodData;
  };
}

export default function Financeiro() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    fee_type: 'fixed',
    fee_value: 0
  });
  
  // Estados para filtro de período
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('vendas-diarias');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [deliveryMethodFilter, setDeliveryMethodFilter] = useState('');
  const [couponFilter, setCouponFilter] = useState('');
  const [promotionFilter, setPromotionFilter] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    Promise.all([
      fetchPaymentMethods(),
      fetchFinancialSummary()
    ]);
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('nome');

      if (error) throw error;
      if (data) setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar métodos de pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialSummary = async (customStartDate?: string, customEndDate?: string, customStartTime?: string, customEndTime?: string) => {
    try {
      let startDate, endDate;
      
      if (customStartDate && customEndDate) {
        // Usar datas e horários personalizados
        const startTimeStr = customStartTime || '00:00';
        const endTimeStr = customEndTime || '23:59';
        startDate = new Date(customStartDate + 'T' + startTimeStr + ':00');
        endDate = new Date(customEndDate + 'T' + endTimeStr + ':59');
      } else {
        // Usar mês atual como padrão
        const now = new Date();
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      }

      const { data: orders, error } = await supabase
        .from('pedidos_unificados')
        .select('total, metodo_pagamento, pago, status')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .not('status', 'eq', 'CANCELADO');

      if (error) throw error;

      if (orders) {
        // Filtrar apenas pedidos pagos para o faturamento
        const paidOrders = orders.filter(order => order.pago === true);
        
        const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = orders.length;
        const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        // Payment methods breakdown - categorizar por métodos específicos
        const paymentMethodsBreakdown = {
          dinheiro: { total: 0, count: 0, percentage: 0 },
          debito: { total: 0, count: 0, percentage: 0 },
          credito: { total: 0, count: 0, percentage: 0 },
          vr: { total: 0, count: 0, percentage: 0 },
          sodexo: { total: 0, count: 0, percentage: 0 },
          ticket: { total: 0, count: 0, percentage: 0 },
          alelo: { total: 0, count: 0, percentage: 0 },
          outros: { total: 0, count: 0, percentage: 0 }
        };
        
        paidOrders.forEach(order => {
          const method = (order.metodo_pagamento || '').toLowerCase().trim();
          const orderTotal = order.total || 0;
          
          // Categorizar por método específico
          if (method.includes('dinheiro') || method.includes('cash')) {
            paymentMethodsBreakdown.dinheiro.total += orderTotal;
            paymentMethodsBreakdown.dinheiro.count += 1;
          } else if (method.includes('débito') || method.includes('debito') || method.includes('débito')) {
            paymentMethodsBreakdown.debito.total += orderTotal;
            paymentMethodsBreakdown.debito.count += 1;
          } else if (method.includes('crédito') || method.includes('credito') || method.includes('crédito')) {
            paymentMethodsBreakdown.credito.total += orderTotal;
            paymentMethodsBreakdown.credito.count += 1;
          } else if (method.includes('vr') || method.includes('vale refeição')) {
            paymentMethodsBreakdown.vr.total += orderTotal;
            paymentMethodsBreakdown.vr.count += 1;
          } else if (method.includes('sodexo')) {
            paymentMethodsBreakdown.sodexo.total += orderTotal;
            paymentMethodsBreakdown.sodexo.count += 1;
          } else if (method.includes('ticket')) {
            paymentMethodsBreakdown.ticket.total += orderTotal;
            paymentMethodsBreakdown.ticket.count += 1;
          } else if (method.includes('alelo')) {
            paymentMethodsBreakdown.alelo.total += orderTotal;
            paymentMethodsBreakdown.alelo.count += 1;
          } else {
            paymentMethodsBreakdown.outros.total += orderTotal;
            paymentMethodsBreakdown.outros.count += 1;
          }
        });

        // Calcular percentuais
        Object.keys(paymentMethodsBreakdown).forEach(key => {
          const methodData = paymentMethodsBreakdown[key as keyof typeof paymentMethodsBreakdown];
          methodData.percentage = totalRevenue > 0 ? (methodData.total / totalRevenue) * 100 : 0;
        });

        setFinancialSummary({
          totalRevenue,
          totalOrders,
          averageTicket,
          paymentMethodsBreakdown
        });
      }
    } catch (error) {
      console.error('Error fetching financial summary:', error);
    }
  };

  const handleSavePaymentMethod = async () => {
    try {
      if (editingMethod) {
        // Update existing method
        const { error } = await supabase
          .from('payment_methods')
          .update({
            nome: formData.nome,
            fee_type: formData.fee_type,
            fee_value: formData.fee_value
          })
          .eq('id', editingMethod.id);

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Método de pagamento atualizado",
        });
      } else {
        // Create new method
        const { error } = await supabase
          .from('payment_methods')
          .insert({
            nome: formData.nome,
            fee_type: formData.fee_type,
            fee_value: formData.fee_value,
            ativo: true
          });

        if (error) throw error;
        
        toast({
          title: "Sucesso",
          description: "Método de pagamento criado",
        });
      }

      resetForm();
      setShowDialog(false);
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar método de pagamento",
        variant: "destructive",
      });
    }
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      nome: method.nome,
      fee_type: method.fee_type,
      fee_value: method.fee_value
    });
    setShowDialog(true);
  };

  const handleDeleteMethod = async (methodId: string) => {
    if (!confirm('Tem certeza que deseja excluir este método de pagamento?')) return;

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId);

      if (error) throw error;
      
      toast({
        title: "Sucesso",
        description: "Método de pagamento excluído",
      });
      
      fetchPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir método de pagamento",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      nome: '',
      fee_type: 'fixed',
      fee_value: 0
    });
    setEditingMethod(null);
  };

  const handleFilterPeriod = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Erro",
        description: "Por favor, selecione as datas de início e fim",
        variant: "destructive",
      });
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      toast({
        title: "Erro",
        description: "A data de início deve ser anterior à data de fim",
        variant: "destructive",
      });
      return;
    }

    // Validação de horário se ambos estiverem preenchidos
    if (startTime && endTime) {
      if (startDate === endDate && startTime > endTime) {
        toast({
          title: "Erro",
          description: "O horário de início deve ser anterior ao horário de fim no mesmo dia",
          variant: "destructive",
        });
        return;
      }
    }

    setFilterLoading(true);
    setIsFiltered(true);
    
    try {
      await fetchFinancialSummary(startDate, endDate, startTime, endTime);
      const timeInfo = startTime && endTime ? ` das ${startTime} às ${endTime}` : '';
      toast({
        title: "Sucesso",
        description: `Filtro aplicado para o período de ${formatDate(startDate)} a ${formatDate(endDate)}${timeInfo}`,
      });
    } catch (error) {
      console.error('Error filtering period:', error);
      toast({
        title: "Erro",
        description: "Erro ao aplicar filtro de período",
        variant: "destructive",
      });
    } finally {
      setFilterLoading(false);
    }
  };

  const handleResetFilter = async () => {
    setStartDate('');
    setEndDate('');
    setStartTime('');
    setEndTime('');
    setIsFiltered(false);
    setFilterLoading(true);
    
    try {
      await fetchFinancialSummary();
      toast({
        title: "Sucesso",
        description: "Filtro removido - exibindo dados do mês atual",
      });
    } catch (error) {
      console.error('Error resetting filter:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover filtro",
        variant: "destructive",
      });
    } finally {
      setFilterLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getPeriodTitle = () => {
    if (isFiltered && startDate && endDate) {
      return `Período: ${formatDate(startDate)} a ${formatDate(endDate)}`;
    }
    return 'Mês Atual';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateFee = (amount: number, method: PaymentMethod) => {
    if (method.fee_type === 'percentage') {
      return (amount * method.fee_value) / 100;
    }
    return method.fee_value;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">Controle financeiro e métodos de pagamento</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Relatório de Vendas</h1>
          <p className="text-muted-foreground">
            Análise detalhada de vendas e métodos de pagamento
          </p>
          {isFiltered && (
            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{getPeriodTitle()}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Método
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMethod ? 'Editar Método de Pagamento' : 'Novo Método de Pagamento'}
                </DialogTitle>
                <DialogDescription>
                  Configure os métodos de pagamento aceitos e suas taxas
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="nome">Nome do Método</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    placeholder="Ex: Cartão de Crédito"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fee_type">Tipo de Taxa</Label>
                  <Select 
                    value={formData.fee_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, fee_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Valor Fixo</SelectItem>
                      <SelectItem value="percentage">Porcentagem</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="fee_value">
                    {formData.fee_type === 'percentage' ? 'Porcentagem (%)' : 'Valor (R$)'}
                  </Label>
                  <Input
                    id="fee_value"
                    type="number"
                    step="0.01"
                    value={formData.fee_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, fee_value: parseFloat(e.target.value) || 0 }))}
                    placeholder={formData.fee_type === 'percentage' ? '3.5' : '2.50'}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSavePaymentMethod}>
                  {editingMethod ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Formas de pagamento</Label>
              <Input
                id="paymentMethod"
                placeholder="Filtre pelas formas de pagamento"
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryMethod">Formas de entrega</Label>
              <Select value={deliveryMethodFilter} onValueChange={setDeliveryMethodFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtre pelas formas de entrega" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="mesa">Mesa</SelectItem>
                  <SelectItem value="balcao">Balcão</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="coupon">Cupons</Label>
              <Input
                id="coupon"
                placeholder="Filtre por cupons"
                value={couponFilter}
                onChange={(e) => setCouponFilter(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="promotion">Promoções</Label>
              <Input
                id="promotion"
                placeholder="Filtre por promocoes"
                value={promotionFilter}
                onChange={(e) => setPromotionFilter(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startDate">Data de Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Fim</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Horário de Início (opcional)</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-2">
              <Label htmlFor="endTime">Horário de Fim (opcional)</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button 
                onClick={handleFilterPeriod}
                disabled={filterLoading || !startDate || !endDate}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {filterLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Filter className="h-4 w-4 mr-2" />
                )}
                {filterLoading ? 'Filtrando...' : 'Filtrar Período'}
              </Button>
              {isFiltered && (
                <Button 
                  variant="outline"
                  onClick={handleResetFilter}
                  disabled={filterLoading}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Resetar
                </Button>
              )}
            </div>
          </div>
          
          {/* Tags de filtros ativos */}
          <div className="flex flex-wrap gap-2 mt-4">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Ages</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Delivery</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Mesa</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Balcao</span>
            {isFiltered && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                Período: {formatDate(startDate)} a {formatDate(endDate)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumo */}
      {financialSummary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resumo</CardTitle>
              <Button variant="outline" size="sm">
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total de vendas</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.totalRevenue)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Taxa de Entrega</p>
                <p className="text-2xl font-bold text-green-600">R$ 6,00</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Taxa Forma Pagamento</p>
                <p className="text-2xl font-bold text-green-600">R$ 0,00</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Total Produtos</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.totalRevenue - 6)}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Qtde. Pedidos</p>
                <p className="text-2xl font-bold text-green-600">{financialSummary.totalOrders}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Ticket Médio</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.averageTicket)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Abas de Relatórios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <Button
                variant={activeTab === 'vendas-diarias' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('vendas-diarias')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Vendas diárias
              </Button>
              <Button
                variant={activeTab === 'por-produtos' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('por-produtos')}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Por Produtos
              </Button>
              <Button
                variant={activeTab === 'por-cupons' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('por-cupons')}
              >
                <Receipt className="h-4 w-4 mr-2" />
                Por Cupons
              </Button>
              <Button
                variant={activeTab === 'por-promocoes' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('por-promocoes')}
              >
                <PieChart className="h-4 w-4 mr-2" />
                Por Promoções
              </Button>
              <Button
                variant={activeTab === 'por-formas-pagamento' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('por-formas-pagamento')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Por Formas de Pagamento
              </Button>
              <Button
                variant={activeTab === 'por-formas-entrega' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab('por-formas-entrega')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Por Formas Entrega
              </Button>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeTab === 'vendas-diarias' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Vendas diárias do dia 23/09/2025</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Dia</th>
                      <th className="text-left p-3 font-medium">Qtde Pedidos</th>
                      <th className="text-left p-3 font-medium">Total vendido</th>
                      <th className="text-left p-3 font-medium">Taxa de Entrega</th>
                      <th className="text-left p-3 font-medium">Valor Líquido</th>
                      <th className="text-left p-3 font-medium">Ticket médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b hover:bg-gray-50">
                      <td className="p-3">23/09/2025</td>
                      <td className="p-3">{financialSummary.totalOrders}</td>
                      <td className="p-3 text-green-600 font-semibold">{formatCurrency(financialSummary.totalRevenue)}</td>
                      <td className="p-3 text-green-600 font-semibold">R$ 6,00</td>
                      <td className="p-3 text-green-600 font-semibold">{formatCurrency(financialSummary.totalRevenue - 6)}</td>
                      <td className="p-3 text-green-600 font-semibold">{formatCurrency(financialSummary.averageTicket)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {activeTab === 'por-formas-pagamento' && financialSummary && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Vendas por Método de Pagamento</h3>
              <div className="space-y-4">
                {[
                  { key: 'dinheiro', label: 'Dinheiro', icon: PiggyBank },
                  { key: 'debito', label: 'Débito', icon: CreditCard },
                  { key: 'credito', label: 'Crédito', icon: CreditCard },
                  { key: 'vr', label: 'VR', icon: CreditCard },
                  { key: 'sodexo', label: 'Sodexo', icon: CreditCard },
                  { key: 'ticket', label: 'Ticket', icon: CreditCard },
                  { key: 'alelo', label: 'Alelo', icon: CreditCard },
                  { key: 'outros', label: 'Outros', icon: CreditCard }
                ].map(({ key, label, icon: Icon }) => {
                  const data = financialSummary.paymentMethodsBreakdown[key as keyof typeof financialSummary.paymentMethodsBreakdown];
                  if (data.count === 0) return null;
                  
                  return (
                    <div key={key} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{label}</p>
                          <p className="text-sm text-muted-foreground">{data.count} pedidos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(data.total)}</p>
                        <p className="text-sm text-muted-foreground">
                          {data.percentage.toFixed(1)}% do total
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          
          {activeTab === 'por-produtos' && (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4" />
              <p>Relatório por produtos em desenvolvimento</p>
            </div>
          )}
          
          {activeTab === 'por-cupons' && (
            <div className="text-center py-8 text-gray-500">
              <Receipt className="h-12 w-12 mx-auto mb-4" />
              <p>Relatório por cupons em desenvolvimento</p>
            </div>
          )}
          
          {activeTab === 'por-promocoes' && (
            <div className="text-center py-8 text-gray-500">
              <PieChart className="h-12 w-12 mx-auto mb-4" />
              <p>Relatório por promoções em desenvolvimento</p>
            </div>
          )}
          
          {activeTab === 'por-formas-entrega' && (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4" />
              <p>Relatório por formas de entrega em desenvolvimento</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Management */}
      <Card>
        <CardHeader>
          <CardTitle>Métodos de Pagamento</CardTitle>
          <CardDescription>Gerencie os métodos de pagamento e suas taxas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{method.nome}</p>
                    <p className="text-sm text-muted-foreground">
                      Taxa: {method.fee_type === 'percentage' 
                        ? `${method.fee_value}%` 
                        : formatCurrency(method.fee_value)
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      Status: {method.ativo ? 'Ativo' : 'Inativo'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ex: {formatCurrency(calculateFee(100, method))} em R$ 100,00
                    </p>
                  </div>
                  <Separator orientation="vertical" className="h-6" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditMethod(method)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteMethod(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {paymentMethods.length === 0 && (
            <div className="text-center py-12">
              <PiggyBank className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum método de pagamento configurado</h3>
              <p className="text-muted-foreground mb-4">
                Configure os métodos de pagamento aceitos pelo seu estabelecimento
              </p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Método
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}