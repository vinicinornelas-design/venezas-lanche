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
  RefreshCw
} from "lucide-react";

interface PaymentMethod {
  id: string;
  nome: string;
  fee_type: string;
  fee_value: number;
  ativo: boolean;
}

interface FinancialSummary {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  paymentMethodsBreakdown: { [key: string]: { total: number; count: number } };
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
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterLoading, setFilterLoading] = useState(false);
  
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

  const fetchFinancialSummary = async (customStartDate?: string, customEndDate?: string) => {
    try {
      let startDate, endDate;
      
      if (customStartDate && customEndDate) {
        // Usar datas personalizadas
        startDate = new Date(customStartDate + 'T00:00:00');
        endDate = new Date(customEndDate + 'T23:59:59');
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

        // Payment methods breakdown
        const paymentMethodsBreakdown: { [key: string]: { total: number; count: number } } = {};
        
        paidOrders.forEach(order => {
          const method = order.metodo_pagamento || 'Não informado';
          if (!paymentMethodsBreakdown[method]) {
            paymentMethodsBreakdown[method] = { total: 0, count: 0 };
          }
          paymentMethodsBreakdown[method].total += order.total || 0;
          paymentMethodsBreakdown[method].count += 1;
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

    setFilterLoading(true);
    setIsFiltered(true);
    
    try {
      await fetchFinancialSummary(startDate, endDate);
      toast({
        title: "Sucesso",
        description: `Filtro aplicado para o período de ${formatDate(startDate)} a ${formatDate(endDate)}`,
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
          <h1 className="text-3xl font-bold">Financeiro</h1>
          <p className="text-muted-foreground">
            Controle financeiro e gestão de métodos de pagamento
          </p>
          {isFiltered && (
            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{getPeriodTitle()}</span>
            </div>
          )}
        </div>
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

      {/* Filtro de Período */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtrar por Período
          </CardTitle>
          <CardDescription>
            Selecione um período específico para visualizar o faturamento, total de pedidos e ticket médio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Fim</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-2">
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
                {filterLoading ? 'Filtrando...' : 'Filtrar'}
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
        </CardContent>
      </Card>

      {/* Financial Summary */}
      {financialSummary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Faturamento {isFiltered ? `(${getPeriodTitle()})` : '(Mês Atual)'}
                  </p>
                  <p className="text-2xl font-bold">{formatCurrency(financialSummary.totalRevenue)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Total de Pedidos {isFiltered ? `(${getPeriodTitle()})` : '(Mês Atual)'}
                  </p>
                  <p className="text-2xl font-bold">{financialSummary.totalOrders}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Ticket Médio {isFiltered ? `(${getPeriodTitle()})` : '(Mês Atual)'}
                  </p>
                  <p className="text-2xl font-bold">{formatCurrency(financialSummary.averageTicket)}</p>
                </div>
                <Calculator className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Methods Breakdown */}
      {financialSummary && Object.keys(financialSummary.paymentMethodsBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Vendas por Método de Pagamento {isFiltered ? `(${getPeriodTitle()})` : '(30 dias)'}
            </CardTitle>
            <CardDescription>
              Distribuição das vendas pelos métodos de pagamento {isFiltered ? 'no período selecionado' : 'nos últimos 30 dias'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(financialSummary.paymentMethodsBreakdown).map(([method, data]) => (
                <div key={method} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">{method}</p>
                      <p className="text-sm text-muted-foreground">{data.count} pedidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(data.total)}</p>
                    <p className="text-sm text-muted-foreground">
                      {((data.total / financialSummary.totalRevenue) * 100).toFixed(1)}% do total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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