import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  X,
  Table,
  User,
  ChefHat
} from "lucide-react";
import { CriarPedidoUnificado, PedidoItem } from "@/types/pedidos-unificados";

interface Item {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  categoria_id: string;
  ativo: boolean;
  foto_url: string;
  categorias?: {
    nome: string;
  };
}

interface Mesa {
  id: string;
  numero: number;
  status: string;
}

interface ItemPedido {
  item: Item;
  quantidade: number;
  observacoes: string;
}

export default function LancarPedido() {
  const [itens, setItens] = useState<Item[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [carrinho, setCarrinho] = useState<ItemPedido[]>([]);
  const [mesaSelecionada, setMesaSelecionada] = useState("");
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [observacoesPedido, setObservacoesPedido] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState<string>("");
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    fetchUserProfile();
    fetchPaymentMethods();
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

  const fetchPaymentMethods = async () => {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      if (data) setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchData = async () => {
    try {
      // Fetch itens do cardápio
      const { data: itensData, error: itensError } = await supabase
        .from('itens_cardapio')
        .select(`
          *,
          categorias (nome)
        `)
        .eq('ativo', true)
        .order('nome');

      if (itensError) throw itensError;
      setItens(itensData || []);

      // Fetch mesas disponíveis
      const { data: mesasData, error: mesasError } = await supabase
        .from('mesas')
        .select('id, numero, status')
        .in('status', ['LIVRE', 'OCUPADA'])
        .order('numero');

      if (mesasError) throw mesasError;
      setMesas(mesasData || []);

      // Fetch categorias
      const { data: categoriasData, error: categoriasError } = await supabase
        .from('categorias')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      if (categoriasError) throw categoriasError;
      setCategorias(categoriasData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const adicionarAoCarrinho = (item: Item) => {
    const itemExistente = carrinho.find(c => c.item.id === item.id);
    if (itemExistente) {
      setCarrinho(carrinho.map(c => 
        c.item.id === item.id 
          ? { ...c, quantidade: c.quantidade + 1 }
          : c
      ));
    } else {
      setCarrinho([...carrinho, { item, quantidade: 1, observacoes: "" }]);
    }
  };

  const removerDoCarrinho = (itemId: string) => {
    const itemExistente = carrinho.find(c => c.item.id === itemId);
    if (itemExistente && itemExistente.quantidade > 1) {
      setCarrinho(carrinho.map(c => 
        c.item.id === itemId 
          ? { ...c, quantidade: c.quantidade - 1 }
          : c
      ));
    } else {
      setCarrinho(carrinho.filter(c => c.item.id !== itemId));
    }
  };

  const calcularTotal = () => {
    const subtotal = carrinho.reduce((total, item) => total + (item.item.preco * item.quantidade), 0);
    
    // Calcular taxa se for cartão
    if (metodoPagamento) {
      const selectedMethod = paymentMethods.find(method => method.nome === metodoPagamento);
      if (selectedMethod && selectedMethod.fee_type === 'percentage') {
        const taxa = (subtotal * selectedMethod.fee_value) / 100;
        return subtotal + taxa;
      }
    }
    
    return subtotal;
  };

  const calcularTaxa = () => {
    const subtotal = carrinho.reduce((total, item) => total + (item.item.preco * item.quantidade), 0);
    
    if (metodoPagamento) {
      const selectedMethod = paymentMethods.find(method => method.nome === metodoPagamento);
      if (selectedMethod && selectedMethod.fee_type === 'percentage') {
        return (subtotal * selectedMethod.fee_value) / 100;
      }
    }
    
    return 0;
  };

  const finalizarPedido = async () => {
    if (carrinho.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione itens ao pedido",
        variant: "destructive",
      });
      return;
    }

    if (!mesaSelecionada) {
      toast({
        title: "Erro",
        description: "Selecione uma mesa",
        variant: "destructive",
      });
      return;
    }

    if (!clienteNome.trim()) {
      toast({
        title: "Erro", 
        description: "Digite o nome do cliente",
        variant: "destructive",
      });
      return;
    }

    if (!metodoPagamento) {
      toast({
        title: "Erro", 
        description: "Selecione um método de pagamento",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get funcionario info
      const { data: funcionarioData } = await supabase
        .from('funcionarios')
        .select('id, nome')
        .eq('profile_id', userProfile?.id)
        .single();

      // Get mesa info
      const mesa = mesas.find(m => m.id === mesaSelecionada);

      // Prepare items for unified table
      const itensPedido: PedidoItem[] = carrinho.map(item => ({
        nome: item.item.nome,
        preco_unitario: item.item.preco,
        quantidade: item.quantidade,
        observacoes: item.observacoes || undefined,
        categoria: item.item.categorias?.nome || undefined,
        adicionais: [] // No additional items for now
      }));

      // Create unified pedido
      const pedidoData: CriarPedidoUnificado = {
        cliente_nome: clienteNome,
        cliente_telefone: clienteTelefone || undefined,
        mesa_numero: mesa?.numero,
        mesa_etiqueta: mesa?.numero?.toString(),
        origem: 'MESA',
        funcionario_id: funcionarioData?.id,
        funcionario_nome: funcionarioData?.nome || userProfile?.nome,
        itens: itensPedido,
        observacoes: observacoesPedido || undefined,
        metodo_pagamento: metodoPagamento,
        status: 'PENDENTE'
      };

      const { data: pedidoUnificado, error: pedidoError } = await supabase
        .from('pedidos_unificados')
        .insert(pedidoData)
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // Update mesa status to OCUPADA if it was LIVRE
      if (mesa?.status === 'LIVRE') {
        await supabase
          .from('mesas')
          .update({ 
            status: 'OCUPADA',
            opened_at: new Date().toISOString(),
            responsavel_funcionario_id: funcionarioData?.id
          })
          .eq('id', mesaSelecionada);
      }

      // Clear form
      setCarrinho([]);
      setMesaSelecionada("");
      setClienteNome("");
      setClienteTelefone("");
      setObservacoesPedido("");
      setMetodoPagamento("");

      toast({
        title: "Sucesso",
        description: `Pedido #${pedidoUnificado.numero_pedido} lançado com sucesso!`,
      });

    } catch (error) {
      console.error('Error creating pedido:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar pedido",
        variant: "destructive",
      });
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
        <h1 className="text-3xl font-bold">Lançar Pedido</h1>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
          Lançar Pedido
        </h1>
        <p className="text-muted-foreground">
          Selecione itens do cardápio e finalize o pedido
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cardápio */}
        <div className="lg:col-span-2 space-y-6">
          {categorias.map((categoria) => {
            const itensDaCategoria = itens.filter(item => item.categoria_id === categoria.id);
            
            if (itensDaCategoria.length === 0) return null;

            return (
              <Card key={categoria.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    {categoria.nome}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {itensDaCategoria.map((item) => (
                      <Card key={item.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.nome}</h4>
                              {item.descricao && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {item.descricao}
                                </p>
                              )}
                            </div>
                            <span className="text-lg font-bold text-primary ml-2">
                              {formatCurrency(item.preco)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {carrinho.find(c => c.item.id === item.id) && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removerDoCarrinho(item.id)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="font-medium">
                                    {carrinho.find(c => c.item.id === item.id)?.quantidade}
                                  </span>
                                </>
                              )}
                              <Button
                                size="sm"
                                onClick={() => adicionarAoCarrinho(item)}
                                className="gradient-primary"
                              >
                                <Plus className="h-3 w-3" />
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Carrinho e Finalização */}
        <div className="space-y-6">
          {/* Carrinho */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrinho ({carrinho.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {carrinho.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Carrinho vazio
                </p>
              ) : (
                <>
                  {carrinho.map((item) => (
                    <div key={item.item.id} className="flex justify-between items-center p-2 bg-muted/50 rounded">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.item.nome}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantidade}x {formatCurrency(item.item.preco)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {formatCurrency(item.item.preco * item.quantidade)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCarrinho(carrinho.filter(c => c.item.id !== item.item.id))}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(carrinho.reduce((total, item) => total + (item.item.preco * item.quantidade), 0))}</span>
                    </div>
                    {calcularTaxa() > 0 && (
                      <div className="flex justify-between items-center text-sm text-muted-foreground">
                        <span>Taxa ({metodoPagamento}):</span>
                        <span>{formatCurrency(calcularTaxa())}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center border-t pt-2">
                      <span className="font-bold">Total:</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(calcularTotal())}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Dados do Pedido */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dados do Pedido
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mesa</Label>
                <Select value={mesaSelecionada} onValueChange={setMesaSelecionada}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a mesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {mesas.map((mesa) => (
                      <SelectItem key={mesa.id} value={mesa.id}>
                        <div className="flex items-center gap-2">
                          <Table className="h-4 w-4" />
                          Mesa {mesa.numero}
                          <Badge variant={mesa.status === 'LIVRE' ? 'default' : 'secondary'} className="text-xs">
                            {mesa.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Nome do Cliente *</Label>
                <Input
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Digite o nome do cliente"
                />
              </div>

              <div>
                <Label>Telefone do Cliente</Label>
                <Input
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <Label>Forma de Pagamento *</Label>
                <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map((method) => (
                      <SelectItem key={method.id} value={method.nome}>
                        {method.nome}
                        {method.fee_type === 'percentage' && (
                          <span className="text-xs text-muted-foreground ml-2">
                            (+{method.fee_value}%)
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Observações</Label>
                <Textarea
                  value={observacoesPedido}
                  onChange={(e) => setObservacoesPedido(e.target.value)}
                  placeholder="Observações sobre o pedido..."
                  rows={3}
                />
              </div>

              <Button 
                onClick={finalizarPedido}
                className="w-full gradient-primary"
                disabled={carrinho.length === 0}
              >
                Finalizar Pedido - {formatCurrency(calcularTotal())}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}