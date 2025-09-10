import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit3,
  User,
  Phone,
  MapPin,
  DollarSign,
  Calendar,
  Filter,
  AlertTriangle
} from "lucide-react";

interface Pedido {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  total: number;
  status: string;
  observacoes: string;
  funcionario_nome: string;
  origem: string;
  metodo_pagamento: string;
  pago: boolean;
  created_at: string;
  updated_at: string;
  endereco_json: any;
  pedidos_itens: Array<{
    item_cardapio_id: string;
    quantidade: number;
    preco_unitario: number;
    observacoes_item: string;
    itens_cardapio: {
      nome: string;
    };
  }>;
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [originFilter, setOriginFilter] = useState<string>('TODOS');
  const [selectedPedido, setSelectedPedido] = useState<Pedido | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  const statusOptions = [
    { value: 'TODOS', label: 'Todos os Status' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'PREPARANDO', label: 'Em Preparo' },
    { value: 'PRONTO', label: 'Pronto' },
    { value: 'ENTREGUE', label: 'Entregue' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ];

  const originOptions = [
    { value: 'TODOS', label: 'Todas as Origens' },
    { value: 'DELIVERY', label: 'Delivery' },
    { value: 'BALCAO', label: 'Balcão' },
    { value: 'MESA', label: 'Mesa' },
  ];

  useEffect(() => {
    fetchUserProfile();
    fetchPedidos();
  }, [statusFilter, originFilter]);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchPedidos = async () => {
    try {
      let query = supabase
        .from('pedidos')
        .select(`
          *,
          pedidos_itens (
            *,
            itens_cardapio (nome)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (statusFilter !== 'TODOS') {
        query = query.eq('status', statusFilter);
      }

      if (originFilter !== 'TODOS') {
        query = query.eq('origem', originFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error fetching pedidos:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pedidos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePedidoStatus = async (pedidoId: string, newStatus: string) => {
    try {
      const updateData: any = { 
        status: newStatus, 
        updated_at: new Date().toISOString()
      };

      // Marcar como pago se status é ENTREGUE
      if (newStatus === 'ENTREGUE') {
        updateData.pago = true;
      }

      // Se temos um funcionário válido, associar ao pedido
      if (userProfile?.nome) {
        updateData.funcionario_nome = userProfile.nome;
      }

      const { error } = await supabase
        .from('pedidos')
        .update(updateData)
        .eq('id', pedidoId);

      if (error) throw error;

      await fetchPedidos();
      toast({
        title: "Sucesso",
        description: `Pedido marcado como ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      console.error('Error updating pedido status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do pedido. Verifique suas permissões.",
        variant: "destructive",
      });
    }
  };

  const togglePagamento = async (pedidoId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ 
          pago: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', pedidoId);

      if (error) throw error;

      await fetchPedidos();
      toast({
        title: "Sucesso",
        description: !currentStatus ? "Pedido marcado como pago" : "Pagamento desmarcado",
      });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status de pagamento",
        variant: "destructive",
      });
    }
  };

  const cancelPedido = async (pedidoId: string) => {
    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ 
          status: 'CANCELADO',
          updated_at: new Date().toISOString()
        })
        .eq('id', pedidoId);

      if (error) throw error;

      await fetchPedidos();
      toast({
        title: "Sucesso",
        description: "Pedido cancelado com sucesso",
      });
    } catch (error) {
      console.error('Error canceling pedido:', error);
      toast({
        title: "Erro",
        description: "Erro ao cancelar pedido",
        variant: "destructive",
      });
    }
  };

  const updateObservacoes = async () => {
    if (!selectedPedido) return;

    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ 
          observacoes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPedido.id);

      if (error) throw error;

      await fetchPedidos();
      setObservacoes("");
      setSelectedPedido(null);
      
      toast({
        title: "Sucesso",
        description: "Observações atualizadas com sucesso",
      });
    } catch (error) {
      console.error('Error updating observacoes:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar observações",
        variant: "destructive",
      });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Gerenciar Pedidos</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="grid gap-6">
          {[...Array(5)].map((_, i) => (
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Gerenciar Pedidos
        </h1>
        <p className="text-muted-foreground">
          Controle completo dos pedidos do restaurante - {userProfile?.nome}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Status do Pedido</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Origem do Pedido</Label>
              <Select value={originFilter} onValueChange={setOriginFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {originOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {pedidos.filter(p => p.status === 'PENDENTE').length}
            </div>
            <p className="text-sm text-warning">Pendentes</p>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {pedidos.filter(p => p.status === 'PREPARANDO').length}
            </div>
            <p className="text-sm text-blue-600">Em Preparo</p>
          </CardContent>
        </Card>
        
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {pedidos.filter(p => p.status === 'PRONTO').length}
            </div>
            <p className="text-sm text-success">Prontos</p>
          </CardContent>
        </Card>
        
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {pedidos.filter(p => p.status === 'ENTREGUE').length}
            </div>
            <p className="text-sm text-green-600">Entregues</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-lg font-bold text-primary">
              {formatCurrency(pedidos
                .filter(p => p.pago)
                .reduce((sum, p) => sum + p.total, 0)
              )}
            </div>
            <p className="text-sm text-primary">Faturado</p>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos List */}
      <div className="grid gap-6">
        {pedidos.map((pedido) => (
          <Card key={pedido.id} className="border-l-4 border-l-primary hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <CardTitle className="text-lg">
                    Pedido #{pedido.id.slice(-8)}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{pedido.cliente_nome}</span>
                    </div>
                    {pedido.cliente_telefone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        <span>{pedido.cliente_telefone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(pedido.created_at)}</span>
                    </div>
                  </div>
                  {pedido.funcionario_nome && (
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">Lançado por:</span> {pedido.funcionario_nome}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(pedido.status)}>
                      {pedido.status}
                    </Badge>
                    <Badge variant="outline" className="bg-muted/50">
                      {pedido.origem}
                    </Badge>
                    {pedido.pago && (
                      <Badge className="bg-success/10 text-success border-success/20">
                        <DollarSign className="h-3 w-3 mr-1" />
                        PAGO
                      </Badge>
                    )}
                  </div>
                  <span className="text-xl font-bold text-primary">
                    {formatCurrency(pedido.total)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Itens do Pedido:</h4>
                <div className="grid gap-2">
                  {pedido.pedidos_itens.map((item, index) => (
                    <div key={index} className="text-sm bg-muted/50 p-3 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-medium">
                            {item.quantidade}x {item.itens_cardapio.nome}
                          </span>
                          {item.observacoes_item && (
                            <div className="text-xs text-muted-foreground italic mt-1">
                              Obs: {item.observacoes_item}
                            </div>
                          )}
                        </div>
                        <span className="text-primary font-medium">
                          {formatCurrency(item.preco_unitario * item.quantidade)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address */}
              {pedido.endereco_json && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-800">Endereço de Entrega:</p>
                  </div>
                  <p className="text-sm text-blue-700">{pedido.endereco_json.endereco}</p>
                </div>
              )}

              {/* Payment Method */}
              {pedido.metodo_pagamento && (
                <div className="text-sm">
                  <span className="font-medium">Pagamento:</span> {pedido.metodo_pagamento}
                </div>
              )}

              {/* Observações */}
              {pedido.observacoes && (
                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                  <p className="text-sm font-medium text-amber-800 mb-1">Observações:</p>
                  <p className="text-sm text-amber-700">{pedido.observacoes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-2">
                {pedido.status === 'PENDENTE' && (
                  <Button 
                    size="sm" 
                    onClick={() => updatePedidoStatus(pedido.id, 'PREPARANDO')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Confirmar & Preparar
                  </Button>
                )}
                
                {pedido.status === 'PREPARANDO' && (
                  <Button 
                    size="sm" 
                    onClick={() => updatePedidoStatus(pedido.id, 'PRONTO')}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Finalizar Preparo
                  </Button>
                )}
                
                {pedido.status === 'PRONTO' && (
                  <Button 
                    size="sm" 
                    onClick={() => updatePedidoStatus(pedido.id, 'ENTREGUE')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Marcar como Entregue
                  </Button>
                )}
                
                {pedido.status !== 'CANCELADO' && pedido.status !== 'ENTREGUE' && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => cancelPedido(pedido.id)}
                    className="text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Cancelar Pedido
                  </Button>
                )}

                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => togglePagamento(pedido.id, pedido.pago)}
                  className={pedido.pago ? "text-orange-600 hover:bg-orange-50 border-orange-200" : "text-green-600 hover:bg-green-50 border-green-200"}
                >
                  <DollarSign className="h-3 w-3 mr-1" />
                  {pedido.pago ? "Desmarcar Pago" : "Marcar como Pago"}
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedPedido(pedido);
                        setObservacoes(pedido.observacoes || "");
                      }}
                    >
                      <Edit3 className="h-3 w-3 mr-1" />
                      Observações
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Observações do Pedido</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Observações sobre o pedido</Label>
                        <Textarea
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          placeholder="Digite observações sobre o pedido..."
                          rows={4}
                        />
                      </div>
                      <Button onClick={updateObservacoes} className="w-full gradient-primary">
                        Salvar Observações
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {pedidos.length === 0 && (
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
          <p className="text-muted-foreground">
            {statusFilter !== 'TODOS' || originFilter !== 'TODOS' 
              ? "Tente ajustar os filtros para ver mais pedidos" 
              : "Os pedidos aparecerão aqui conforme forem sendo realizados"
            }
          </p>
        </div>
      )}
    </div>
  );
}