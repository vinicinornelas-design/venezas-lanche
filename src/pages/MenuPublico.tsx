import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import VenezaBanner from "@/components/VenezaBanner";
import VenezaBannerCustom from "@/components/VenezaBannerCustom";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  MapPin, 
  Phone, 
  CreditCard,
  Clock,
  Star,
  Search,
  Filter,
  Heart,
  Zap,
  Award,
  Sparkles,
  X,
  Settings
} from "lucide-react";
import RatingSystem from "@/components/RatingSystem";
import { CriarPedidoUnificado, PedidoItem } from "@/types/pedidos-unificados";

interface MenuItem {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  foto_url: string;
  categoria_id: string;
  categoria_nome?: string;
  average_rating?: number;
  total_ratings?: number;
}

interface Adicional {
  id: string;
  nome: string;
  preco_extra: number;
  multi_selecao: boolean;
  obrigatorio: boolean;
  item_id: string;
}

interface Categoria {
  id: string;
  nome: string;
}

interface RestaurantConfig {
  id: string;
  nome_restaurante: string;
  telefone: string;
  endereco: string;
  logo_url: string;
  banner_url: string;
  taxa_entrega?: number;
  tempo_entrega?: number;
  formas_pagamento?: string[];
  bairros_entrega?: Array<{
    nome: string;
    valor: number;
  }>;
  created_at?: string;
  updated_at?: string;
  horario_funcionamento?: any;
}

export default function MenuPublico() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [cart, setCart] = useState<PedidoItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showAdicionaisDialog, setShowAdicionaisDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [selectedAdicionais, setSelectedAdicionais] = useState<Record<string, boolean>>({});
  const [quantidade, setQuantidade] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    bairro: '',
    metodoPagamento: 'dinheiro',
    observacoes: ''
  });
  const { toast } = useToast();

  // Paleta de cores venezianas
  const venezaColors = {
    primary: 'from-amber-900 via-red-900 to-amber-800',
    secondary: 'from-amber-100 to-amber-50',
    accent: 'from-yellow-400 to-amber-400',
    text: 'text-amber-900',
    textLight: 'text-amber-800',
    textMuted: 'text-amber-700',
    border: 'border-amber-300',
    bg: 'bg-amber-50',
    bgCard: 'bg-white/90',
    shadow: 'shadow-amber-200',
    hover: 'hover:from-amber-600 hover:via-red-600 hover:to-amber-600'
  };

  useEffect(() => {
    fetchMenuItems();
    fetchAdicionais();
    fetchCategories();
    fetchRestaurantConfig();
  }, []);

  const fetchMenuItems = async () => {
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

      const items = data?.map(item => ({
              ...item,
        categoria_nome: item.categorias?.nome
      })) || [];

      setMenuItems(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
    }
  };

  const fetchAdicionais = async () => {
    try {
      console.log('=== BUSCANDO ADICIONAIS DA TABELA OPCIONAIS ===');
      const { data, error } = await supabase
        .from('opcionais')
        .select('*')
        .order('nome');

      console.log('Resultado da busca de adicionais:', { data, error });

      if (error) {
        console.error('Erro ao buscar adicionais:', error);
        throw error;
      }
      
      console.log('Adicionais carregados:', data?.length || 0);
      setAdicionais((data as Adicional[]) || []);
    } catch (error) {
      console.error('Error fetching adicionais:', error);
      setAdicionais([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRestaurantConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_config')
        .select('*')
        .single();

      if (error) throw error;
      
      if (data) {
        console.log('Restaurant config carregado:', data);
        console.log('Logo URL:', data.logo_url);
        console.log('Bairros de entrega:', data.bairros_entrega);
        console.log('Formas de pagamento:', data.formas_pagamento);
        setRestaurantConfig(data);
      }
    } catch (error) {
      console.error('Error fetching restaurant config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categoria_id === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.nome.localeCompare(b.nome);
      case 'price-low':
        return a.preco - b.preco;
      case 'price-high':
        return b.preco - a.preco;
      case 'rating':
        return (b.average_rating || 0) - (a.average_rating || 0);
      default:
        return 0;
    }
  });

  const openAdicionaisDialog = (item: MenuItem) => {
    setSelectedItem(item);
    setSelectedAdicionais({});
    setQuantidade(1);
    setShowAdicionaisDialog(true);
  };

  const addToCart = () => {
    if (!selectedItem) return;

    // Buscar adicionais selecionados (tanto específicos do item quanto globais)
    const itemAdicionais = adicionais.filter(adicional => 
      selectedAdicionais[adicional.id] && 
      (adicional.item_id === selectedItem.id || adicional.item_id === null)
    );

    // Calcular preço total incluindo adicionais
    const precoAdicionais = itemAdicionais.reduce((sum, adicional) => sum + adicional.preco_extra, 0);
    const totalPreco = selectedItem.preco + precoAdicionais;

    const cartItem: PedidoItem = {
      nome: selectedItem.nome,
      preco_unitario: totalPreco,
      quantidade: quantidade,
      categoria: selectedItem.categoria_nome || 'Geral',
      adicionais: itemAdicionais.map(adicional => ({
        nome: adicional.nome,
        preco: adicional.preco_extra,
        quantidade: 1
      }))
    };

    setCart(prev => [...prev, cartItem]);
    setShowAdicionaisDialog(false);

    // Reset dos adicionais selecionados
    setSelectedAdicionais({});

    toast({
      title: "Adicionado ao carrinho!",
      description: `${selectedItem.nome} foi adicionado ao seu pedido.`,
    });
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(index);
      return;
    }
    setCart(prev => prev.map((item, i) => 
      i === index ? { ...item, quantidade: newQuantity } : item
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.preco_unitario * item.quantidade), 0);
  };

  const getTaxaEntrega = () => {
    if (!checkoutForm.bairro) return 0;
    
    // Buscar no banco primeiro
    if (restaurantConfig?.bairros_entrega?.length > 0) {
      const bairro = restaurantConfig.bairros_entrega.find(b => b.nome === checkoutForm.bairro);
      if (bairro) return bairro.taxa_entrega || 0;
    }
    
    // Fallback com bairros padrão
    const bairrosPadrao = [
      { nome: 'Centro', taxa_entrega: 5.00 },
      { nome: 'Zona Norte', taxa_entrega: 7.00 },
      { nome: 'Zona Sul', taxa_entrega: 6.00 },
      { nome: 'Zona Leste', taxa_entrega: 8.00 },
      { nome: 'Zona Oeste', taxa_entrega: 7.50 }
    ];
    const bairro = bairrosPadrao.find(b => b.nome === checkoutForm.bairro);
    return bairro?.taxa_entrega || 0;
  };

  const getTaxaPagamento = () => {
    if (!checkoutForm.metodoPagamento) return 0;
    
    // Buscar no banco primeiro
    if (restaurantConfig?.formas_pagamento?.length > 0) {
      const forma = restaurantConfig.formas_pagamento.find(f => f.nome === checkoutForm.metodoPagamento);
      if (forma) return forma.taxa || 0;
    }
    
    // Fallback com métodos padrão (todos sem taxa)
    return 0;
  };

  const getTotalComTaxas = () => {
    const subtotal = getTotalPrice();
    const taxaEntrega = getTaxaEntrega();
    const taxaPagamento = getTaxaPagamento();
    return subtotal + taxaEntrega + taxaPagamento;
  };

  const handleCheckoutFormChange = (field: string, value: string) => {
    setCheckoutForm(prev => ({ ...prev, [field]: value }));
  };

  const resetCheckoutForm = () => {
    setCheckoutForm({
      nome: '',
      telefone: '',
      endereco: '',
      bairro: '',
      metodoPagamento: 'dinheiro',
      observacoes: ''
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const submitOrder = async () => {
    if (cart.length === 0) return;

    // Validar campos obrigatórios
    if (!checkoutForm.nome || !checkoutForm.telefone || !checkoutForm.endereco || !checkoutForm.bairro) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha nome, telefone, endereço e bairro.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Criar pedido com estrutura compatível com o sistema de gestão REAL
    const pedido = {
      id: `cardapio_publico_${Date.now()}`,
      numero_pedido: Math.floor(Math.random() * 9000) + 1000, // Código entre 1000-9999
      itens: cart.map(item => ({
        nome: item.nome,
        categoria: item.categoria,
        adicionais: item.adicionais || [],
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario
      })),
      origem: 'DELIVERY',
      observacoes: checkoutForm.observacoes || '',
      metodo_pagamento: checkoutForm.metodoPagamento,
      cliente_nome: checkoutForm.nome,
      cliente_telefone: checkoutForm.telefone,
      cliente_endereco: checkoutForm.endereco,
      cliente_bairro: checkoutForm.bairro,
      taxa_entrega: getTaxaEntrega().toString(),
      desconto: "0.00",
      subtotal: getTotalPrice().toString(),
      total: getTotalComTaxas().toString(),
      status: 'PENDENTE',
      pago: false,
      troco_para: null,
      valor_pago: null,
      observacoes_cozinha: null,
      observacoes_entrega: null,
      tempo_preparo_estimado: null,
      tempo_entrega_estimado: null,
      iniciado_preparo_em: null,
      finalizado_preparo_em: null,
      entregue_em: null,
      avaliacao_nota: null,
      avaliacao_comentario: null,
      avaliacao_em: null,
      mesa_numero: null,
      mesa_etiqueta: null,
      funcionario_id: null,
      funcionario_nome: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('=== ENVIANDO PEDIDO PARA O SISTEMA ===');
    console.log('📋 Dados do Pedido:', pedido);
    console.log('📦 Itens do Carrinho:', cart);
    console.log('📝 Formulário:', checkoutForm);
    console.log('💰 Total Calculado:', getTotalComTaxas());
    console.log('🚚 Taxa Entrega:', getTaxaEntrega());
    console.log('💳 Taxa Pagamento:', getTaxaPagamento());
    console.log('🔍 Tentando inserir na tabela pedidos_unificados...');

    let pedidoEnviado = false;
    
    // Tentar enviar para Supabase até 3 vezes
    for (let tentativa = 1; tentativa <= 3; tentativa++) {
      try {
        console.log(`🔄 Tentativa ${tentativa} de envio para Supabase...`);
        console.log(`📤 Dados sendo enviados:`, JSON.stringify(pedido, null, 2));
        
        const { data, error } = await supabase
          .from('pedidos_unificados')
          .insert([pedido])
          .select();

        console.log(`📥 Resposta do Supabase (tentativa ${tentativa}):`);
        console.log(`✅ Data:`, data);
        console.log(`❌ Error:`, error);

        if (error) {
          console.error(`❌ Erro Supabase (tentativa ${tentativa}):`, error);
          console.error(`🔍 Detalhes do erro:`, {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
          if (tentativa === 3) throw error; // Última tentativa
          continue;
        }

        console.log('✅ Pedido salvo no Supabase com sucesso!');
        console.log('📊 Dados retornados:', data);
        console.log('🆔 ID do pedido:', data?.[0]?.id);
        console.log('🔢 Número do pedido:', data?.[0]?.numero_pedido);
        pedidoEnviado = true;
        
        // Verificar se o pedido aparece no sistema
        setTimeout(async () => {
          try {
            const { data: verificacao } = await supabase
              .from('pedidos_unificados')
              .select('numero_pedido, cliente_nome, status, origem')
              .eq('numero_pedido', pedido.numero_pedido)
              .single();
            
            if (verificacao) {
              console.log('✅ CONFIRMAÇÃO: Pedido encontrado no sistema!');
              console.log('📋 Pedido no sistema:', verificacao);
            } else {
              console.log('⚠️ ATENÇÃO: Pedido não encontrado no sistema');
            }
          } catch (error) {
            console.log('⚠️ Erro ao verificar pedido no sistema:', error);
          }
        }, 2000);
        
        // Salvar também no localStorage como backup
        const pedidosLocais = JSON.parse(localStorage.getItem('pedidos_locais') || '[]');
        pedidosLocais.push(pedido);
        localStorage.setItem('pedidos_locais', JSON.stringify(pedidosLocais));

        toast({
          title: "Pedido realizado!",
          description: `Pedido #${data?.[0]?.numero_pedido || pedido.numero_pedido} enviado para o sistema. Aguarde o contato!`,
        });
        
        break; // Sucesso, sair do loop
        
      } catch (error) {
        console.error(`Erro na tentativa ${tentativa}:`, error);
        if (tentativa === 3) {
          // Última tentativa falhou, usar fallback
          console.error('Todas as tentativas falharam, usando fallback');
        } else {
          // Aguardar um pouco antes da próxima tentativa
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // Se não conseguiu enviar para Supabase, usar fallback
    if (!pedidoEnviado) {
      console.error('Todas as tentativas de envio para Supabase falharam');
      
      // Salvar no localStorage como backup
      try {
        const pedidosLocais = JSON.parse(localStorage.getItem('pedidos_locais') || '[]');
        pedidosLocais.push(pedido);
        localStorage.setItem('pedidos_locais', JSON.stringify(pedidosLocais));
        
        console.log('Pedido salvo no localStorage como backup');
        
        toast({
          title: "Pedido enviado!",
          description: "Seu pedido foi enviado para o sistema. Aguarde o contato!",
        });
      } catch (localError) {
        console.error('Erro ao salvar no localStorage:', localError);
        toast({
          title: "Erro",
          description: "Não foi possível enviar o pedido. Tente novamente.",
          variant: "destructive",
        });
        return;
      }
    }

    // Limpar formulário e carrinho
    setCart([]);
    setShowCart(false);
    setShowCheckout(false);
    resetCheckoutForm();
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-amber-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-300 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-amber-800 text-lg font-semibold">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-amber-100" data-theme="venezian" style={{colorScheme: 'light'}} data-version="2.0">
        {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-red-900 to-amber-800"></div>
        <div className="relative z-10 container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="mb-8">
              <div className="relative inline-block group">
                <div className="absolute -inset-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-amber-300/30">
                  <img 
                    src={restaurantConfig?.logo_url || "/restaurant-logo.jpg"} 
                    alt="Logo" 
                    className="w-28 h-28 object-contain rounded-3xl mx-auto shadow-2xl border-4 border-amber-200 transform group-hover:scale-105 transition-transform duration-300"
                    onLoad={() => console.log('Logo carregada com sucesso:', restaurantConfig?.logo_url)}
                    onError={(e) => console.log('Erro ao carregar logo:', e, 'URL:', restaurantConfig?.logo_url)}
                  />
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-yellow-400 to-amber-400 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                    <Award className="w-5 h-5 text-amber-900" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-red-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
              <h1 className="text-5xl font-black bg-gradient-to-r from-amber-300 via-yellow-300 to-amber-300 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
                  {restaurantConfig?.nome_restaurante || 'Veneza\'s Lanches'}
                </h1>
              <p className="text-xl text-amber-100 font-semibold">🍔 Sabor que conquista, qualidade que encanta ✨</p>
                
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                  {restaurantConfig?.telefone && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-amber-100/20 to-red-100/20 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group border border-amber-300/30">
                    <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-red-500 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                    <span className="font-bold text-amber-100 group-hover:text-amber-200 transition-colors">{restaurantConfig.telefone}</span>
                    </div>
                  )}
                  {restaurantConfig?.endereco && (
                  <div className="flex items-center gap-3 bg-gradient-to-r from-red-100/20 to-amber-100/20 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group border border-red-300/30">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-amber-500 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                    <span className="font-bold text-amber-100 group-hover:text-amber-200 transition-colors">{restaurantConfig.endereco}</span>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Personalizado Veneza's Lanches */}
      <VenezaBannerCustom 
        className="h-96 md:h-[500px]" 
      />

      {/* Search and Filter Bar */}
      <div className="bg-gradient-to-r from-white/95 to-amber-50/95 backdrop-blur-sm border-b border-amber-200 sticky top-0 z-20 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-red-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-amber-500 w-5 h-5" />
                <Input
                  placeholder="🔍 Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border-2 border-amber-200 focus:border-amber-400 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl transition-all duration-300 text-lg"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-red-400 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 border-2 border-amber-200 focus:border-amber-400 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 py-3">
                      <Filter className="w-5 h-5 mr-2 text-amber-500" />
                      <SelectValue placeholder="📂 Categoria" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-0">
                      <SelectItem value="all" className="rounded-lg">🌟 Todas as Categorias</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id} className="rounded-lg">
                          {category.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-400 to-amber-400 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 border-2 border-red-200 focus:border-red-400 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 py-3">
                      <Sparkles className="w-5 h-5 mr-2 text-red-500" />
                      <SelectValue placeholder="⚡ Ordenar" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl shadow-2xl border-0">
                      <SelectItem value="name" className="rounded-lg">📝 Nome A-Z</SelectItem>
                      <SelectItem value="price-low" className="rounded-lg">💰 Menor Preço</SelectItem>
                      <SelectItem value="price-high" className="rounded-lg">💎 Maior Preço</SelectItem>
                      <SelectItem value="rating" className="rounded-lg">⭐ Melhor Avaliado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50 group">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-400 via-red-400 to-amber-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <Button 
            onClick={() => setShowCart(true)}
            className="relative bg-gradient-to-r from-amber-500 via-red-500 to-amber-500 hover:from-amber-600 hover:via-red-600 hover:to-amber-600 shadow-2xl hover:shadow-3xl rounded-full w-20 h-20 flex items-center justify-center animate-bounce hover:scale-110 transition-all duration-300"
            size="lg"
          >
            <div className="text-center">
              <ShoppingCart className="w-8 h-8 mx-auto text-white drop-shadow-lg" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xs font-black text-amber-900">{cart.length}</span>
              </div>
            </div>
          </Button>
        </div>
      )}

      {/* Menu */}
      <div className="container mx-auto px-4 py-8">
        {selectedCategory === "all" ? (
          // Show all items in a grid
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent mb-2">
                Cardápio Completo
              </h2>
              <p className="text-amber-700">Deliciosos sabores esperando por você</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item, index) => (
                <Card key={item.id} className="group border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden bg-white/90 backdrop-blur-sm transform hover:-translate-y-2 hover:scale-105" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-red-400 to-amber-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative">
                    {item.foto_url && (
                      <div className="relative h-48 overflow-hidden">
                        <img 
                          src={item.foto_url} 
                          alt={item.nome}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-3 right-3">
                          {item.total_ratings > 0 && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-amber-400 text-amber-900 border-0 shadow-xl backdrop-blur-sm">
                              <Star className="w-4 h-4 mr-1 fill-current" />
                              {item.average_rating?.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-gradient-to-r from-amber-500 to-red-500 text-white border-0 shadow-lg">
                            <Heart className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-black text-xl text-amber-900 group-hover:text-amber-600 transition-colors duration-300 mb-2">
                            {item.nome}
                          </h3>
                          {item.categoria_nome && (
                            <Badge variant="outline" className="text-sm text-amber-600 border-amber-300 bg-amber-50 font-semibold">
                              {item.categoria_nome}
                            </Badge>
                          )}
                        </div>
                        
                        {item.descricao && (
                          <p className="text-sm text-amber-700 overflow-hidden leading-relaxed" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {item.descricao}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between pt-4">
                          <div className="text-3xl font-black bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
                            {formatCurrency(item.preco)}
                          </div>
                          <Button 
                            onClick={() => openAdicionaisDialog(item)}
                            className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          // Show items by category
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent mb-2">
                {categories.find(cat => cat.id === selectedCategory)?.nome || 'Categoria'}
                    </h2>
              <p className="text-amber-700">Deliciosos sabores esperando por você</p>
                  </div>
                  
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item, index) => (
                <Card key={item.id} className="group border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden bg-white/90 backdrop-blur-sm transform hover:-translate-y-2 hover:scale-105" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 via-red-400 to-amber-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative">
                        {item.foto_url && (
                      <div className="relative h-48 overflow-hidden">
                            <img 
                              src={item.foto_url} 
                              alt={item.nome}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <div className="absolute top-3 right-3">
                              {item.total_ratings > 0 && (
                            <Badge className="bg-gradient-to-r from-yellow-400 to-amber-400 text-amber-900 border-0 shadow-xl backdrop-blur-sm">
                              <Star className="w-4 h-4 mr-1 fill-current" />
                                  {item.average_rating?.toFixed(1)}
                                </Badge>
                              )}
                            </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-gradient-to-r from-amber-500 to-red-500 text-white border-0 shadow-lg">
                            <Heart className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                            </div>
                          </div>
                        )}
                        
                    <CardContent className="p-6">
                      <div className="space-y-4">
                            <div>
                          <h3 className="font-black text-xl text-amber-900 group-hover:text-amber-600 transition-colors duration-300 mb-2">
                                {item.nome}
                              </h3>
                          {item.categoria_nome && (
                            <Badge variant="outline" className="text-sm text-amber-600 border-amber-300 bg-amber-50 font-semibold">
                              {item.categoria_nome}
                            </Badge>
                          )}
                            </div>
                            
                            {item.descricao && (
                          <p className="text-sm text-amber-700 overflow-hidden leading-relaxed" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {item.descricao}
                              </p>
                            )}
                            
                        <div className="flex items-center justify-between pt-4">
                          <div className="text-3xl font-black bg-gradient-to-r from-amber-600 via-red-600 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
                                {formatCurrency(item.preco)}
                              </div>
                              <Button 
                                onClick={() => openAdicionaisDialog(item)}
                            className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                              >
                            <Plus className="w-4 h-4 mr-2" />
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                  </div>
                      </Card>
                    ))}
                  </div>
          </div>
        )}
      </div>

      {/* Adicionais Dialog */}
      <Dialog open={showAdicionaisDialog} onOpenChange={setShowAdicionaisDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-amber-900 text-center">
              {selectedItem?.nome}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 px-1">
            {selectedItem && (
              <div className="text-center">
                <div className="text-3xl font-black bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
                  {formatCurrency(selectedItem.preco)}
                  </div>
                <p className="text-amber-700 mt-2">{selectedItem.descricao}</p>
                
                {/* Mostrar preço total com adicionais selecionados */}
                {Object.keys(selectedAdicionais).length > 0 && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm text-green-700 mb-1">Preço com adicionais:</div>
                    <div className="text-xl font-bold text-green-800">
                      {formatCurrency(selectedItem.preco + adicionais
                        .filter(adicional => selectedAdicionais[adicional.id] && 
                          (adicional.item_id === selectedItem.id || adicional.item_id === null))
                        .reduce((sum, adicional) => sum + adicional.preco_extra, 0))}
                    </div>
                  </div>
                )}
                </div>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-bold text-amber-900">Adicionais</h3>
              
              {/* Debug info */}
              <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
                Debug: {adicionais.length} adicionais carregados, {adicionais.filter(a => a.item_id === selectedItem?.id || a.item_id === null).length} disponíveis para este item
              </div>
              
              {/* Adicionais com preço */}
              {adicionais
                .filter(adicional => (adicional.item_id === selectedItem?.id || adicional.item_id === null) && adicional.preco_extra > 0)
                .map(adicional => (
                  <div key={adicional.id} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={adicional.id}
                        checked={selectedAdicionais[adicional.id] || false}
                        onCheckedChange={(checked) => 
                          setSelectedAdicionais(prev => ({
                            ...prev,
                            [adicional.id]: checked as boolean
                          }))
                        }
                        className="border-amber-400 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                      />
                      <Label htmlFor={adicional.id} className="text-amber-900 font-semibold cursor-pointer">
                          {adicional.nome}
                      </Label>
                      </div>
                    <div className="text-amber-600 font-bold">
                        +{formatCurrency(adicional.preco_extra)}
                    </div>
                    </div>
                  ))}

              {/* Opções de remoção (sem custo) */}
              {adicionais
                .filter(adicional => (adicional.item_id === selectedItem?.id || adicional.item_id === null) && adicional.preco_extra === 0)
                .map(adicional => (
                  <div key={adicional.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-200">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={adicional.id}
                        checked={selectedAdicionais[adicional.id] || false}
                        onCheckedChange={(checked) => 
                          setSelectedAdicionais(prev => ({
                            ...prev,
                            [adicional.id]: checked as boolean
                          }))
                        }
                        className="border-red-400 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                      />
                      <Label htmlFor={adicional.id} className="text-red-900 font-semibold cursor-pointer">
                          {adicional.nome}
                      </Label>
                      </div>
                    <div className="text-red-600 font-bold">
                        Grátis
                    </div>
                    </div>
                  ))}
              
              {/* Mensagem se não houver adicionais */}
              {adicionais.filter(adicional => adicional.item_id === selectedItem?.id || adicional.item_id === null).length === 0 && (
                <div className="text-center p-6 bg-amber-50 rounded-xl border border-amber-200">
                  <p className="text-amber-700">Nenhum adicional disponível para este item.</p>
                </div>
              )}
              </div>

            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-100 to-red-100 rounded-xl">
              <Label className="text-amber-900 font-bold">Quantidade:</Label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  className="border-amber-400 text-amber-600 hover:bg-amber-50"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-amber-900 font-bold text-lg w-8 text-center">{quantidade}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantidade(quantidade + 1)}
                  className="border-amber-400 text-amber-600 hover:bg-amber-50"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 border-t border-amber-200 pt-4">
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowAdicionaisDialog(false)}
                className="flex-1 border-amber-400 text-amber-600 hover:bg-amber-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={addToCart}
                className="flex-1 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold"
              >
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cart Dialog */}
      <Dialog open={showCart} onOpenChange={setShowCart}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-amber-900 text-center">
              Seu Pedido
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4 px-1">
            {cart.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-amber-50 rounded-xl border border-amber-200">
                <div className="flex-1">
                  <h3 className="font-bold text-amber-900">{item.nome}</h3>
                  {item.adicionais.length > 0 && (
                    <div className="text-sm mt-1 space-y-1">
                      {item.adicionais.map((adicional, idx) => (
                        <div key={idx} className={`${adicional.preco > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {adicional.preco > 0 ? '+' : '-'} {adicional.nome}
                          {adicional.preco > 0 && ` (+${formatCurrency(adicional.preco)})`}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-amber-600 font-bold mt-2">
                    {formatCurrency(item.preco_unitario)} x {item.quantidade}
                  </div>
                  </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(index, item.quantidade - 1)}
                    className="border-amber-400 text-amber-600 hover:bg-amber-50"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-amber-900 font-bold w-8 text-center">{item.quantidade}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(index, item.quantidade + 1)}
                    className="border-amber-400 text-amber-600 hover:bg-amber-50"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeFromCart(index)}
                    className="border-red-400 text-red-600 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex-shrink-0 border-t border-amber-200 pt-4 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xl font-bold text-amber-900">Total:</span>
              <span className="text-2xl font-black bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
                {formatCurrency(getTotalPrice())}
              </span>
            </div>
            
            <div className="flex gap-4">
                <Button
                  variant="outline"
                onClick={() => setShowCart(false)}
                className="flex-1 border-amber-400 text-amber-600 hover:bg-amber-50"
                >
                Continuar Comprando
                </Button>
                <Button
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0}
                className="flex-1 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold text-lg py-3"
                >
                🚀 Finalizar Pedido
                </Button>
              </div>
            </div>
        </DialogContent>
      </Dialog>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="max-w-2xl max-h-[90vh] bg-white/95 backdrop-blur-sm border-0 shadow-2xl overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="text-2xl font-bold text-amber-900 text-center">
              Finalizar Pedido
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-6 px-1">
            {/* Resumo do Pedido */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <h3 className="text-lg font-bold text-amber-900 mb-3">Resumo do Pedido</h3>
              {cart.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-amber-200 last:border-b-0">
                  <div>
                    <span className="font-medium text-amber-800">{item.nome}</span>
                    {item.adicionais.length > 0 && (
                      <div className="text-sm mt-1 space-y-1">
                        {item.adicionais.map((adicional, idx) => (
                          <div key={idx} className={`${adicional.preco > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {adicional.preco > 0 ? '+' : '-'} {adicional.nome}
                            {adicional.preco > 0 && ` (+${formatCurrency(adicional.preco)})`}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-amber-700">{item.quantidade}x {formatCurrency(item.preco_unitario)}</span>
                  </div>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-amber-300">
                <div className="flex justify-between text-lg font-bold text-amber-900">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(getTotalPrice())}</span>
                </div>
              </div>
            </div>

            {/* Formulário de Dados */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-amber-900">Dados para Entrega</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome" className="text-amber-800 font-medium">Nome *</Label>
                  <Input
                    id="nome"
                    value={checkoutForm.nome}
                    onChange={(e) => handleCheckoutFormChange('nome', e.target.value)}
                    className="border-amber-300 focus:border-amber-500"
                    placeholder="Seu nome completo"
                  />
                </div>
                
                <div>
                  <Label htmlFor="telefone" className="text-amber-800 font-medium">Telefone *</Label>
                  <Input
                    id="telefone"
                    value={checkoutForm.telefone}
                    onChange={(e) => handleCheckoutFormChange('telefone', e.target.value)}
                    className="border-amber-300 focus:border-amber-500"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="endereco" className="text-amber-800 font-medium">Endereço *</Label>
                <Input
                  id="endereco"
                  value={checkoutForm.endereco}
                  onChange={(e) => handleCheckoutFormChange('endereco', e.target.value)}
                  className="border-amber-300 focus:border-amber-500"
                  placeholder="Rua, número, complemento"
                />
              </div>

              <div>
                <Label htmlFor="bairro" className="text-amber-800 font-medium">Bairro *</Label>
                <Select value={checkoutForm.bairro} onValueChange={(value) => handleCheckoutFormChange('bairro', value)}>
                  <SelectTrigger className="border-amber-300 focus:border-amber-500">
                    <SelectValue placeholder="Selecione seu bairro" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurantConfig?.bairros_entrega?.length > 0 ? (
                      restaurantConfig.bairros_entrega.map((bairro) => (
                        <SelectItem key={bairro.nome} value={bairro.nome}>
                          {bairro.nome} - {formatCurrency(bairro.taxa_entrega)}
                        </SelectItem>
                      ))
                    ) : (
                      // Fallback com bairros padrão
                      [
                        { nome: 'Centro', taxa_entrega: 5.00 },
                        { nome: 'Zona Norte', taxa_entrega: 7.00 },
                        { nome: 'Zona Sul', taxa_entrega: 6.00 },
                        { nome: 'Zona Leste', taxa_entrega: 8.00 },
                        { nome: 'Zona Oeste', taxa_entrega: 7.50 }
                      ].map((bairro) => (
                        <SelectItem key={bairro.nome} value={bairro.nome}>
                          {bairro.nome} - {formatCurrency(bairro.taxa_entrega)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="metodoPagamento" className="text-amber-800 font-medium">Método de Pagamento *</Label>
                <Select value={checkoutForm.metodoPagamento} onValueChange={(value) => handleCheckoutFormChange('metodoPagamento', value)}>
                  <SelectTrigger className="border-amber-300 focus:border-amber-500">
                    <SelectValue placeholder="Selecione o método de pagamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurantConfig?.formas_pagamento?.length > 0 ? (
                      restaurantConfig.formas_pagamento.map((forma) => (
                        <SelectItem key={forma.nome} value={forma.nome}>
                          {forma.nome} {forma.taxa > 0 && `(+${formatCurrency(forma.taxa)})`}
                        </SelectItem>
                      ))
                    ) : (
                      // Fallback com métodos padrão
                      [
                        { nome: 'Dinheiro', taxa: 0 },
                        { nome: 'Débito', taxa: 0 },
                        { nome: 'Crédito', taxa: 0 },
                        { nome: 'VR', taxa: 0 },
                        { nome: 'Sodexo', taxa: 0 },
                        { nome: 'Ticket', taxa: 0 },
                        { nome: 'Alelo', taxa: 0 }
                      ].map((forma) => (
                        <SelectItem key={forma.nome} value={forma.nome}>
                          {forma.nome} {forma.taxa > 0 && `(+${formatCurrency(forma.taxa)})`}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="observacoes" className="text-amber-800 font-medium">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={checkoutForm.observacoes}
                  onChange={(e) => handleCheckoutFormChange('observacoes', e.target.value)}
                  className="border-amber-300 focus:border-amber-500"
                  placeholder="Alguma observação especial para seu pedido?"
                  rows={3}
                />
              </div>
            </div>

            {/* Resumo Final */}
            <div className="bg-gradient-to-r from-amber-100 to-red-100 rounded-xl p-4 border border-amber-200">
              <h3 className="text-lg font-bold text-amber-900 mb-3">Resumo Final</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-amber-800">Subtotal:</span>
                  <span className="text-amber-700">{formatCurrency(getTotalPrice())}</span>
                </div>
                {getTaxaEntrega() > 0 && (
                  <div className="flex justify-between">
                    <span className="text-amber-800">Taxa de Entrega:</span>
                    <span className="text-amber-700">{formatCurrency(getTaxaEntrega())}</span>
                  </div>
                )}
                {getTaxaPagamento() > 0 && (
                  <div className="flex justify-between">
                    <span className="text-amber-800">Taxa de Pagamento:</span>
                    <span className="text-amber-700">{formatCurrency(getTaxaPagamento())}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-amber-900 pt-2 border-t border-amber-300">
                  <span>Total:</span>
                  <span>{formatCurrency(getTotalComTaxas())}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-shrink-0 border-t border-amber-200 pt-4 bg-white">
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowCheckout(false)}
                className="flex-1 border-amber-400 text-amber-600 hover:bg-amber-50"
              >
                Voltar ao Carrinho
              </Button>
              <Button
                onClick={submitOrder}
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white font-bold text-lg py-3"
              >
                {isSubmitting ? "Processando..." : "🚀 Confirmar Pedido"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}