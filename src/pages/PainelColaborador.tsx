import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import LancarPedido from "@/components/LancarPedido";
import MesasColaborador from "@/components/MesasColaborador";
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Table,
  User,
  TrendingUp,
  Plus
} from "lucide-react";

interface Pedido {
  id: string;
  cliente_nome: string;
  cliente_telefone: string;
  total: number;
  status: string;
  observacoes: string;
  origem: string;
  created_at: string;
  updated_at: string;
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

export default function PainelColaborador() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [observacao, setObservacao] = useState("");
  const [selectedPedido, setSelectedPedido] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
    fetchPedidos();
  }, []);

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
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          pedidos_itens (
            *,
            itens_cardapio (nome)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

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
      // Get funcionario info from profiles
      const funcionarioInfo = await supabase
        .from('funcionarios')
        .select('id, nome')
        .eq('profile_id', userProfile?.id)
        .single();

      const { error } = await supabase
        .from('pedidos')
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString(),
          funcionario_id: funcionarioInfo.data?.id,
          funcionario_nome: funcionarioInfo.data?.nome || userProfile?.nome
        })
        .eq('id', pedidoId);

      if (error) throw error;

      await fetchPedidos();
      toast({
        title: "Sucesso",
        description: `Pedido ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      console.error('Error updating pedido status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status do pedido",
        variant: "destructive",
      });
    }
  };

  const addObservacao = async () => {
    if (!observacao.trim() || !selectedPedido) return;

    try {
      const { error } = await supabase
        .from('pedidos')
        .update({ 
          observacoes: observacao,
          updated_at: new Date().toISOString(),
          funcionario_id: userProfile?.id
        })
        .eq('id', selectedPedido);

      if (error) throw error;

      await fetchPedidos();
      setObservacao("");
      setSelectedPedido("");
      
      toast({
        title: "Sucesso",
        description: "Observação adicionada ao pedido",
      });
    } catch (error) {
      console.error('Error adding observacao:', error);
      toast({
        title: "Erro",
        description: "Erro ao adicionar observação",
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Painel do Colaborador</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="grid gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-24 bg-muted rounded"></div>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Painel do Colaborador
          </h1>
          <p className="text-muted-foreground">
            Olá, {userProfile?.nome}! Gerencie os pedidos em tempo real
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <User className="h-3 w-3 mr-1" />
            {userProfile?.papel}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pedidos" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pedidos" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Pedidos
          </TabsTrigger>
          <TabsTrigger value="mesas" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Mesas
          </TabsTrigger>
          <TabsTrigger value="lancar" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Lançar Pedido
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos" className="space-y-6">

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Pedidos Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {pedidos.filter(p => p.status === 'PENDENTE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Em Preparo</p>
                <p className="text-2xl font-bold text-blue-600">
                  {pedidos.filter(p => p.status === 'PREPARANDO').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Prontos</p>
                <p className="text-2xl font-bold text-green-600">
                  {pedidos.filter(p => p.status === 'PRONTO').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Total Hoje</p>
                <p className="text-2xl font-bold text-purple-600">
                  {pedidos.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pedidos List */}
      <div className="grid gap-6">
        {pedidos.map((pedido) => (
          <Card key={pedido.id} className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    Pedido #{pedido.id.slice(-8)}
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{pedido.cliente_nome}</span>
                    <span>•</span>
                    <span>{pedido.cliente_telefone}</span>
                    <span>•</span>
                    <span>{new Date(pedido.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <Badge className={getStatusColor(pedido.status)}>
                    {pedido.status}
                  </Badge>
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(pedido.total)}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Itens do Pedido:</h4>
                {pedido.pedidos_itens.map((item, index) => (
                  <div key={index} className="text-sm bg-muted/50 p-2 rounded">
                    <span className="font-medium">{item.quantidade}x {item.itens_cardapio.nome}</span>
                    <span className="text-muted-foreground ml-2">
                      {formatCurrency(item.preco_unitario)}
                    </span>
                    {item.observacoes_item && (
                      <div className="text-xs text-muted-foreground italic mt-1">
                        Obs: {item.observacoes_item}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Observações */}
              {pedido.observacoes && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium text-blue-800 mb-1">Observações:</p>
                  <p className="text-sm text-blue-700">{pedido.observacoes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {pedido.status === 'PENDENTE' && (
                  <Button 
                    size="sm" 
                    onClick={() => updatePedidoStatus(pedido.id, 'PREPARANDO')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Preparar
                  </Button>
                )}
                {pedido.status === 'PREPARANDO' && (
                  <Button 
                    size="sm" 
                    onClick={() => updatePedidoStatus(pedido.id, 'PRONTO')}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Finalizar
                  </Button>
                )}
                {pedido.status === 'PRONTO' && (
                  <Button 
                    size="sm" 
                    onClick={() => updatePedidoStatus(pedido.id, 'ENTREGUE')}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Entregar
                  </Button>
                )}
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => updatePedidoStatus(pedido.id, 'CANCELADO')}
                  className="text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setSelectedPedido(pedido.id)}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Observação
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Observação</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Observação sobre o pedido</Label>
                        <Textarea
                          value={observacao}
                          onChange={(e) => setObservacao(e.target.value)}
                          placeholder="Digite observações sobre o pedido..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={addObservacao} className="w-full">
                        Adicionar Observação
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
                Os pedidos aparecerão aqui conforme forem sendo realizados
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="mesas">
          <MesasColaborador />
        </TabsContent>

        <TabsContent value="lancar">
          <LancarPedido />
        </TabsContent>
      </Tabs>
    </div>
  );
}