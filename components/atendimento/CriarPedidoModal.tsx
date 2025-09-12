import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Minus, 
  ShoppingCart, 
  X, 
  User, 
  Phone, 
  CreditCard,
  Calculator,
  Save
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

interface ItemCardapio {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number;
  foto_url: string | null;
  categoria_id: string;
  categorias?: {
    nome: string;
  };
}

interface Categoria {
  id: string;
  nome: string;
  ativo: boolean | null;
}

interface CarrinhoItem {
  item: ItemCardapio;
  quantidade: number;
  observacoes: string;
}

interface CriarPedidoModalProps {
  mesa: Mesa;
  funcionarios: Funcionario[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CriarPedidoModal({ mesa, funcionarios, onClose, onSuccess }: CriarPedidoModalProps) {
  const [loading, setLoading] = useState(false);
  const [itens, setItens] = useState<ItemCardapio[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>("TODAS");
  
  // Dados do cliente
  const [clienteNome, setClienteNome] = useState("");
  const [clienteTelefone, setClienteTelefone] = useState("");
  const [observacoesPedido, setObservacoesPedido] = useState("");
  const [metodoPagamento, setMetodoPagamento] = useState("");
  
  const { toast } = useToast();

  useEffect(() => {
    fetchItensCardapio();
    fetchCategorias();
  }, []);

  const fetchItensCardapio = async () => {
    try {
      const { data, error } = await supabase
        .from('itens_cardapio')
        .select(`
          *,
          categorias(nome)
        `)
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setItens(data || []);
    } catch (error) {
      console.error('Erro ao buscar itens do cardápio:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cardápio",
        variant: "destructive",
      });
    }
  };

  const fetchCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setCategorias(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };

  const itensFiltrados = categoriaSelecionada === "TODAS" 
    ? itens 
    : itens.filter(item => item.categoria_id === categoriaSelecionada);

  const adicionarAoCarrinho = (item: ItemCardapio) => {
    const itemExistente = carrinho.find(c => c.item.id === item.id);
    
    if (itemExistente) {
      setCarrinho(carrinho.map(c => 
        c.item.id === item.id 
          ? { ...c, quantidade: c.quantidade + 1 }
          : c
      ));
    } else {
      setCarrinho([...carrinho, {
        item,
        quantidade: 1,
        observacoes: ""
      }]);
    }
  };

  const removerDoCarrinho = (itemId: string) => {
    setCarrinho(carrinho.filter(c => c.item.id !== itemId));
  };

  const atualizarQuantidade = (itemId: string, quantidade: number) => {
    if (quantidade <= 0) {
      removerDoCarrinho(itemId);
      return;
    }
    
    setCarrinho(carrinho.map(c => 
      c.item.id === itemId 
        ? { ...c, quantidade }
        : c
    ));
  };

  const atualizarObservacoes = (itemId: string, observacoes: string) => {
    setCarrinho(carrinho.map(c => 
      c.item.id === itemId 
        ? { ...c, observacoes }
        : c
    ));
  };

  const calcularSubtotal = () => {
    return carrinho.reduce((total, item) => total + (item.item.preco * item.quantidade), 0);
  };

  const calcularTotal = () => {
    return calcularSubtotal();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const finalizarPedido = async () => {
    if (carrinho.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item ao carrinho",
        variant: "destructive",
      });
      return;
    }

    if (!clienteNome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do cliente é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get funcionario info
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { data: funcionarioData } = await supabase
        .from('funcionarios')
        .select('id, nome')
        .eq('profile_id', profile?.id)
        .single();

      // Prepare items for unified table
      const itensPedido = carrinho.map(item => ({
        nome: item.item.nome,
        preco_unitario: item.item.preco,
        quantidade: item.quantidade,
        subtotal: item.item.preco * item.quantidade,
        observacoes: item.observacoes || undefined,
        categoria: item.item.categorias?.nome || undefined,
        adicionais: []
      }));

      // Create unified pedido
      const pedidoData = {
        cliente_nome: clienteNome,
        cliente_telefone: clienteTelefone || undefined,
        mesa_numero: mesa.numero,
        mesa_etiqueta: mesa.numero.toString(),
        origem: 'MESA',
        funcionario_id: funcionarioData?.id,
        funcionario_nome: funcionarioData?.nome,
        itens: itensPedido,
        subtotal: calcularSubtotal(),
        total: calcularTotal(),
        observacoes: observacoesPedido || undefined,
        metodo_pagamento: metodoPagamento || undefined,
        status: 'PENDENTE'
      };

      const { data: pedidoUnificado, error: pedidoError } = await supabase
        .from('pedidos_unificados')
        .insert(pedidoData)
        .select()
        .single();

      if (pedidoError) throw pedidoError;

      // Update mesa status to OCUPADA if it was LIVRE
      if (mesa.status === 'LIVRE') {
        await supabase
          .from('mesas')
          .update({ 
            status: 'OCUPADA',
            opened_at: new Date().toISOString(),
            responsavel_funcionario_id: funcionarioData?.id
          })
          .eq('id', mesa.id);
      }

      toast({
        title: "Pedido criado!",
        description: `Pedido #${pedidoUnificado.numero_pedido} criado com sucesso`,
      });

      onSuccess();
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar pedido. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Criar Pedido - Mesa {mesa.numero}
          </DialogTitle>
          <DialogDescription>
            Adicione itens ao carrinho e finalize o pedido
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Dados do Cliente */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cliente-nome">Nome *</Label>
                <Input
                  id="cliente-nome"
                  value={clienteNome}
                  onChange={(e) => setClienteNome(e.target.value)}
                  placeholder="Nome do cliente"
                />
              </div>
              <div>
                <Label htmlFor="cliente-telefone">Telefone</Label>
                <Input
                  id="cliente-telefone"
                  value={clienteTelefone}
                  onChange={(e) => setClienteTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="metodo-pagamento">Método de Pagamento</Label>
                <Select value={metodoPagamento} onValueChange={setMetodoPagamento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                    <SelectItem value="CARTAO_DEBITO">Cartão Débito</SelectItem>
                    <SelectItem value="CARTAO_CREDITO">Cartão Crédito</SelectItem>
                    <SelectItem value="PIX">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="observacoes">Observações do Pedido</Label>
                <Textarea
                  id="observacoes"
                  value={observacoesPedido}
                  onChange={(e) => setObservacoesPedido(e.target.value)}
                  placeholder="Observações gerais do pedido..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cardápio */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Cardápio</CardTitle>
              <div className="flex gap-2">
                <Select value={categoriaSelecionada} onValueChange={setCategoriaSelecionada}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TODAS">Todas as Categorias</SelectItem>
                    {categorias.map(categoria => (
                      <SelectItem key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                {itensFiltrados.map((item) => (
                  <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{item.nome}</h4>
                          {item.descricao && (
                            <p className="text-xs text-muted-foreground mt-1">{item.descricao}</p>
                          )}
                          <Badge variant="outline" className="mt-2">
                            {item.categorias?.nome}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{formatCurrency(item.preco)}</p>
                          <Button
                            size="sm"
                            onClick={() => adicionarAoCarrinho(item)}
                            className="mt-2"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Carrinho */}
        {carrinho.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Carrinho ({carrinho.length} itens)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {carrinho.map((item) => (
                  <div key={item.item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.item.nome}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.item.preco)} cada
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => atualizarQuantidade(item.item.id, item.quantidade - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center">{item.quantidade}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => atualizarQuantidade(item.item.id, item.quantidade + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="w-24 text-right">
                      <p className="font-medium">{formatCurrency(item.item.preco * item.quantidade)}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removerDoCarrinho(item.item.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center">
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Subtotal:</p>
                  <p className="text-lg font-bold">{formatCurrency(calcularTotal())}</p>
                </div>
                <Button 
                  onClick={finalizarPedido}
                  disabled={loading}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  {loading ? (
                    <>
                      <Save className="h-4 w-4 mr-2 animate-spin" />
                      Finalizando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Finalizar Pedido
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
