import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Phone,
  CreditCard,
  Receipt,
  RefreshCw
} from "lucide-react";

interface Mesa {
  id: string;
  numero: number;
  status: string;
  etiqueta: string | null;
  observacoes: string | null;
  opened_at: string | null;
  closed_at: string | null;
  responsavel_funcionario_id: string | null;
  funcionario_nome?: string;
  tempo_ocupacao?: number;
}

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  ativo: boolean;
}

interface PedidoUnificado {
  id: string;
  numero_pedido: number;
  cliente_nome: string;
  cliente_telefone: string | null;
  mesa_numero: number;
  funcionario_nome: string | null;
  itens: any[];
  subtotal: number;
  total: number;
  status: string;
  metodo_pagamento: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

interface PedidosMesaProps {
  mesa: Mesa;
  funcionarios: Funcionario[];
  onClose: () => void;
  onUpdate: () => void;
}

export default function PedidosMesa({ mesa, funcionarios, onUpdate, onClose }: PedidosMesaProps) {
  const [pedidos, setPedidos] = useState<PedidoUnificado[]>([]);
  const [loading, setLoading] = useState(true);
  const [fechandoConta, setFechandoConta] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPedidosMesa();
  }, [mesa.id]);

  const fetchPedidosMesa = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos_unificados')
        .select('*')
        .eq('mesa_numero', mesa.numero)
        .in('status', ['PENDENTE', 'PREPARANDO', 'PRONTO', 'ENTREGUE'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Erro ao buscar pedidos da mesa:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar pedidos da mesa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PREPARANDO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PRONTO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ENTREGUE':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDENTE':
        return <Clock className="h-4 w-4" />;
      case 'PREPARANDO':
        return <RefreshCw className="h-4 w-4" />;
      case 'PRONTO':
        return <CheckCircle className="h-4 w-4" />;
      case 'ENTREGUE':
        return <CheckCircle className="h-4 w-4" />;
      case 'CANCELADO':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calcularTotalMesa = () => {
    return pedidos.reduce((total, pedido) => total + pedido.total, 0);
  };

  const fecharConta = async () => {
    if (pedidos.length === 0) {
      toast({
        title: "Erro",
        description: "Não há pedidos para fechar",
        variant: "destructive",
      });
      return;
    }

    setFechandoConta(true);
    try {
      // Marcar todos os pedidos como entregues
      const pedidoIds = pedidos.map(p => p.id);
      
      const { error: updateError } = await supabase
        .from('pedidos_unificados')
        .update({ 
          status: 'ENTREGUE',
          updated_at: new Date().toISOString()
        })
        .in('id', pedidoIds);

      if (updateError) throw updateError;

      // Liberar a mesa
      const { error: mesaError } = await supabase
        .from('mesas')
        .update({ 
          status: 'LIVRE',
          closed_at: new Date().toISOString(),
          responsavel_funcionario_id: null
        })
        .eq('id', mesa.id);

      if (mesaError) throw mesaError;

      toast({
        title: "Conta fechada!",
        description: `Mesa ${mesa.numero} liberada com sucesso`,
      });

      onUpdate();
      onClose();
    } catch (error) {
      console.error('Erro ao fechar conta:', error);
      toast({
        title: "Erro",
        description: "Erro ao fechar conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setFechandoConta(false);
    }
  };

  const adicionarMaisItens = () => {
    onClose();
    // Aqui você pode abrir o modal de criar pedido novamente
    // ou navegar para a página de atendimento
  };

  if (loading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pedidos da Mesa {mesa.numero}</DialogTitle>
            <DialogDescription>Carregando pedidos...</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pedidos da Mesa {mesa.numero}
          </DialogTitle>
          <DialogDescription>
            Gerencie os pedidos e feche a conta
          </DialogDescription>
        </DialogHeader>

        {/* Informações da Mesa */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Informações da Mesa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Cliente</p>
                <p className="font-medium">{pedidos[0]?.cliente_nome || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="font-medium">{pedidos[0]?.cliente_telefone || 'Não informado'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Método de Pagamento</p>
                <p className="font-medium">{pedidos[0]?.metodo_pagamento || 'Não definido'}</p>
              </div>
            </div>
            {pedidos[0]?.observacoes && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Observações</p>
                <p className="font-medium">{pedidos[0].observacoes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lista de Pedidos */}
        {pedidos.length > 0 ? (
          <div className="space-y-4">
            {pedidos.map((pedido) => (
              <Card key={pedido.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        Pedido #{pedido.numero_pedido}
                      </CardTitle>
                      <CardDescription>
                        {formatDateTime(pedido.created_at)}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(pedido.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(pedido.status)}
                          {pedido.status}
                        </div>
                      </Badge>
                      <p className="font-bold text-lg">{formatCurrency(pedido.total)}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {pedido.itens.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium">{item.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.quantidade}x {formatCurrency(item.preco_unitario)}
                          </p>
                          {item.observacoes && (
                            <p className="text-xs text-muted-foreground italic">
                              Obs: {item.observacoes}
                            </p>
                          )}
                        </div>
                        <p className="font-medium">{formatCurrency(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground text-center">
                Esta mesa não possui pedidos ativos
              </p>
            </CardContent>
          </Card>
        )}

        {/* Total e Ações */}
        {pedidos.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Total da Mesa:</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(calcularTotalMesa())}
                  </p>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={adicionarMaisItens}
                  className="flex-1"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Mais Itens
                </Button>
                <Button 
                  onClick={fecharConta}
                  disabled={fechandoConta}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {fechandoConta ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Fechando...
                    </>
                  ) : (
                    <>
                      <Receipt className="h-4 w-4 mr-2" />
                      Fechar Conta
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
