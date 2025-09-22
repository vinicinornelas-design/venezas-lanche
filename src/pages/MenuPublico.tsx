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
  multi_selecao?: boolean;
  obrigatorio?: boolean;
  item_id?: string;
}

interface CartItem extends MenuItem {
  quantidade: number;
  observacoes?: string;
  adicionais?: Adicional[];
  preco_total?: number;
}

interface RestaurantConfig {
  nome_restaurante: string;
  logo_url: string;
  banner_url: string;
  telefone: string;
  endereco: string;
  horario_funcionamento: any;
}

export default function MenuPublico() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantConfig | null>(null);
  const [bairros, setBairros] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const { toast } = useToast();

  // Estados para popup de adicionais
  const [adicionais, setAdicionais] = useState<Adicional[]>([]);
  const [isAdicionaisDialogOpen, setIsAdicionaisDialogOpen] = useState(false);
  const [selectedItemForAdicionais, setSelectedItemForAdicionais] = useState<MenuItem | null>(null);
  const [selectedAdicionais, setSelectedAdicionais] = useState<Adicional[]>([]);
  const [observacoes, setObservacoes] = useState("");

  // Customer form data
  const [customerData, setCustomerData] = useState({
    nome: '',
    telefone: '',
    endereco: '',
    bairro_id: '',
    metodo_pagamento_id: '',
    observacoes: ''
  });

  useEffect(() => {
    fetchMenuData();
    fetchRestaurantConfig();
    fetchBairros();
    fetchPaymentMethods();
    fetchAdicionais();
  }, []);



  const fetchMenuData = async () => {
    try {
      // Fetch categories
      const { data: categoriesData } = await supabase
        .from('categorias')
        .select('*')
        .eq('ativo', true)
        .order('ordem');

      // Fetch menu items with categories and ratings
      const { data: itemsData } = await supabase
        .from('itens_cardapio')
        .select(`
          *,
          categorias (
            nome
          )
        `)
        .eq('ativo', true);

      if (categoriesData) setCategories(categoriesData);
      
      if (itemsData) {
        // Fetch ratings for each item
        const itemsWithRatings = await Promise.all(
          itemsData.map(async (item) => {
            const { data: ratingsData } = await supabase
              .from('avaliacoes')
              .select('nota')
              .eq('item_cardapio_id', item.id);

            const totalRatings = ratingsData?.length || 0;
            const averageRating = totalRatings > 0 
              ? ratingsData.reduce((sum, r) => sum + r.nota, 0) / totalRatings 
              : 0;

            return {
              ...item,
              categoria_nome: item.categorias?.nome,
              average_rating: averageRating,
              total_ratings: totalRatings
            };
          })
        );
        
        setMenuItems(itemsWithRatings);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar cardápio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantConfig = async () => {
    try {
      const { data } = await supabase
        .from('restaurant_config')
        .select('*')
        .single();

      if (data) setRestaurantConfig(data);
    } catch (error) {
      console.error('Error fetching restaurant config:', error);
    }
  };

  const fetchBairros = async () => {
    try {
      const { data } = await supabase
        .from('bairros')
        .select('*')
        .eq('ativo', true);

      if (data) setBairros(data);
    } catch (error) {
      console.error('Error fetching neighborhoods:', error);
    }
  };

  const fetchPaymentMethods = async () => {
    try {
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('ativo', true);

      if (data) setPaymentMethods(data);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
    }
  };

  const fetchAdicionais = async () => {
    try {
      // Primeiro tenta buscar do Supabase
      const { data, error } = await supabase
        .from('opcionais')
        .select('*')
        .order('nome');

      if (error) {
        console.log('Tabela opcionais não existe, usando dados locais');
        // Se não existir, usa dados do localStorage
        const localAdicionais = getLocalAdicionais();
        setAdicionais(localAdicionais);
        // Salva no localStorage para persistência
        localStorage.setItem('venezas_adicionais', JSON.stringify(localAdicionais));
      } else {
        setAdicionais(data || []);
        // Salva no localStorage para backup
        localStorage.setItem('venezas_adicionais', JSON.stringify(data || []));
      }
    } catch (error) {
      console.log('Erro ao buscar adicionais, usando dados locais:', error);
      // Em caso de erro, usa dados do localStorage
      const localAdicionais = getLocalAdicionais();
      setAdicionais(localAdicionais);
      // Salva no localStorage para persistência
      localStorage.setItem('venezas_adicionais', JSON.stringify(localAdicionais));
    }
  };

  const getLocalAdicionais = (): Adicional[] => {
    const stored = localStorage.getItem('venezas_adicionais');
    if (stored) {
      return JSON.parse(stored);
    }
    
    // Dados padrão com todos os adicionais solicitados
    return [
      // Molhos e condimentos
      { id: '1', nome: 'Molho verde adicional', preco_extra: 1.50, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '2', nome: 'Molho Barbecue', preco_extra: 1.50, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '3', nome: 'Ketchup e Maionese adicional', preco_extra: 2.00, multi_selecao: false, obrigatorio: false, item_id: null },
      
      // Ingredientes básicos
      { id: '4', nome: 'Ovo adicional', preco_extra: 3.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '5', nome: 'Abacaxi adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '6', nome: 'Banana adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '7', nome: 'Bife de Hambúrguer adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '8', nome: 'Cebola Caramelizada adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '9', nome: 'Presunto adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '10', nome: 'Cebola adicional', preco_extra: 4.00, multi_selecao: false, obrigatorio: false, item_id: null },
      
      // Ingredientes premium
      { id: '11', nome: 'Frango adicional', preco_extra: 5.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '12', nome: 'Muçarela adicional', preco_extra: 5.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '13', nome: 'Bacon adicional', preco_extra: 6.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '14', nome: 'Linguiça adicional', preco_extra: 6.00, multi_selecao: false, obrigatorio: false, item_id: null },
      
      // Ingredientes artesanais
      { id: '15', nome: 'Bife artesanal adicional', preco_extra: 8.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '16', nome: 'Catupiry adicional', preco_extra: 8.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '17', nome: 'Cheddar adicional no lanche', preco_extra: 8.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '18', nome: 'Costela ao molho barbecue', preco_extra: 8.00, multi_selecao: false, obrigatorio: false, item_id: null },
      
      // Adicionais especiais
      { id: '19', nome: 'Cheddar adicional na batata frita', preco_extra: 10.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '20', nome: 'Requeijão cremoso adicional', preco_extra: 12.00, multi_selecao: false, obrigatorio: false, item_id: null },
      
      // Opções de remoção (sem custo)
      { id: '21', nome: 'Sem Pão', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '22', nome: 'Sem Presunto', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '23', nome: 'Sem Mussarela', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '24', nome: 'Sem maionese', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '25', nome: 'Sem ketchup', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null },
      { id: '26', nome: 'Sem molho verde', preco_extra: 0.00, multi_selecao: false, obrigatorio: false, item_id: null }
    ];
  };

  const openAdicionaisDialog = (item: MenuItem) => {
    console.log('=== ABRINDO MODAL DE ADICIONAIS ===');
    console.log('Item:', item.nome);
    
    // Carrega os adicionais diretamente
    const localAdicionais = getLocalAdicionais();
    console.log('Adicionais carregados:', localAdicionais.length);
    console.log('Primeiros 3 adicionais:', localAdicionais.slice(0, 3));
    
    // Define o item selecionado
    setSelectedItemForAdicionais(item);
    setSelectedAdicionais([]);
    setObservacoes("");
    
    // Carrega os adicionais no estado
    setAdicionais(localAdicionais);
    console.log('Estado adicionais definido para:', localAdicionais.length);
    
    // Abre o modal
    setIsAdicionaisDialogOpen(true);
    console.log('Modal aberto');
  };

  const addToCartWithAdicionais = () => {
    if (!selectedItemForAdicionais) return;

    const precoAdicionais = selectedAdicionais.reduce((total, adicional) => total + adicional.preco_extra, 0);
    const precoTotal = selectedItemForAdicionais.preco + precoAdicionais;

    const cartItem: CartItem = {
      ...selectedItemForAdicionais,
      quantidade: 1,
      adicionais: selectedAdicionais,
      observacoes: observacoes,
      preco_total: precoTotal
    };

    setCart(prev => {
      const existingItem = prev.find(cartItem => 
        cartItem.id === selectedItemForAdicionais.id && 
        JSON.stringify(cartItem.adicionais) === JSON.stringify(selectedAdicionais) &&
        cartItem.observacoes === observacoes
      );
      
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === selectedItemForAdicionais.id && 
          JSON.stringify(cartItem.adicionais) === JSON.stringify(selectedAdicionais) &&
          cartItem.observacoes === observacoes
            ? { ...cartItem, quantidade: cartItem.quantidade + 1 }
            : cartItem
        );
      }
      return [...prev, cartItem];
    });

    setIsAdicionaisDialogOpen(false);
    setSelectedItemForAdicionais(null);
    setSelectedAdicionais([]);
    setObservacoes("");

    toast({
      title: "Item adicionado ao carrinho",
      description: `${selectedItemForAdicionais.nome} foi adicionado com sucesso!`,
    });
  };

  const toggleAdicional = (adicional: Adicional) => {
    setSelectedAdicionais(prev => {
      const isSelected = prev.some(sel => sel.id === adicional.id);
      if (isSelected) {
        return prev.filter(sel => sel.id !== adicional.id);
      } else {
        return [...prev, adicional];
      }
    });
  };

  const updateCartItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantidade: newQuantity } : item
        )
      );
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.preco * item.quantidade), 0);
  };

  const getTaxaEntrega = () => {
    const selectedBairro = bairros.find(b => b.id === customerData.bairro_id);
    return selectedBairro ? selectedBairro.taxa_entrega : 0;
  };

  const getTaxaPagamento = () => {
    const selectedMethod = paymentMethods.find(m => m.id === customerData.metodo_pagamento_id);
    if (!selectedMethod) return 0;
    
    const subtotal = getCartTotal();
    return selectedMethod.fee_type === 'percentage' 
      ? (subtotal * selectedMethod.fee_value / 100)
      : selectedMethod.fee_value;
  };

  const getFinalTotal = () => {
    return getCartTotal() + getTaxaEntrega() + getTaxaPagamento();
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Filter and sort items
  const getFilteredItems = () => {
    let filtered = menuItems;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.descricao.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(item => item.categoria_id === selectedCategory);
    }

    // Sort items
    switch (sortBy) {
      case "price-low":
        filtered = filtered.sort((a, b) => a.preco - b.preco);
        break;
      case "price-high":
        filtered = filtered.sort((a, b) => b.preco - a.preco);
        break;
      case "rating":
        filtered = filtered.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      default:
        filtered = filtered.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "Carrinho vazio",
        description: "Adicione itens ao carrinho antes de finalizar",
        variant: "destructive",
      });
      return;
    }

    if (!customerData.nome || !customerData.telefone || !customerData.endereco || !customerData.bairro_id || !customerData.metodo_pagamento_id) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get the payment method name
      const selectedPaymentMethod = paymentMethods.find(m => m.id === customerData.metodo_pagamento_id);
      const selectedBairro = bairros.find(b => b.id === customerData.bairro_id);
      
      // Prepare items for unified table
      const itensPedido: PedidoItem[] = cart.map(item => ({
        nome: item.nome,
        preco_unitario: item.preco,
        quantidade: item.quantidade,
        observacoes: item.observacoes || undefined,
        categoria: item.categoria_nome || undefined,
        adicionais: [] // No additional items for now
      }));

      // Create unified pedido
      const pedidoData: CriarPedidoUnificado = {
        cliente_nome: customerData.nome,
        cliente_telefone: customerData.telefone,
        cliente_endereco: customerData.endereco,
        cliente_bairro: selectedBairro?.nome,
        origem: 'DELIVERY',
        itens: itensPedido,
        taxa_entrega: getTaxaEntrega(),
        metodo_pagamento: selectedPaymentMethod?.nome || 'Dinheiro',
        observacoes: customerData.observacoes || undefined,
        status: 'PENDENTE'
      };

      const { data: pedidoUnificado, error: orderError } = await supabase
        .from('pedidos_unificados')
        .insert(pedidoData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Clear cart and form
      setCart([]);
      setCustomerData({
        nome: '',
        telefone: '',
        endereco: '',
        bairro_id: '',
        metodo_pagamento_id: '',
        observacoes: ''
      });
      setShowCart(false);

      toast({
        title: "Pedido realizado!",
        description: `Pedido #${pedidoUnificado.numero_pedido} foi enviado com sucesso. Aguarde o contato do restaurante.`,
      });

    } catch (error) {
      console.error('Error submitting order:', error);
      toast({
        title: "Erro ao finalizar pedido",
        description: "Tente novamente em alguns instantes",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200 to-red-200 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-200 to-orange-200 rounded-full opacity-20 animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-full opacity-10 animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="text-center space-y-8 relative z-10">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 flex items-center justify-center mx-auto animate-bounce shadow-2xl">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-orange-500" />
              </div>
            </div>
            <div className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-ping">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
              <Zap className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent animate-pulse">
              Preparando Delícias
            </h2>
            <p className="text-lg text-gray-700 font-medium">Os melhores sabores estão chegando...</p>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (showCart) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-orange-100 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={restaurantConfig?.logo_url || "/restaurant-logo.jpg"} alt="Logo" className="w-12 h-12 object-contain rounded-xl shadow-md" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    {restaurantConfig?.nome_restaurante || 'Veneza\'s Lanches'}
                  </h1>
                  <p className="text-sm text-gray-600">Seu pedido</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowCart(false)}
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                ← Voltar ao Cardápio
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-6">
            {/* Cart Items */}
            <Card className="border-orange-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Seus Itens ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border border-orange-100 rounded-xl bg-gradient-to-r from-orange-50 to-red-50">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">{item.nome}</h4>
                      <p className="text-sm text-orange-600 font-medium">{formatCurrency(item.preco)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.id, item.quantidade - 1)}
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-semibold text-gray-800">{item.quantidade}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.id, item.quantidade + 1)}
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {cart.length === 0 && (
                  <div className="text-center py-12">
                    <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Seu carrinho está vazio</p>
                    <p className="text-gray-400 text-sm">Adicione alguns itens deliciosos!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Data Form */}
            {cart.length > 0 && (
              <Card className="border-orange-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Dados de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome" className="text-gray-700 font-medium">Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={customerData.nome}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Seu nome completo"
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone" className="text-gray-700 font-medium">Telefone *</Label>
                      <Input
                        id="telefone"
                        value={customerData.telefone}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, telefone: e.target.value }))}
                        placeholder="(31) 99999-9999"
                        className="border-orange-200 focus:border-orange-400"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="endereco" className="text-gray-700 font-medium">Endereço Completo *</Label>
                    <Input
                      id="endereco"
                      value={customerData.endereco}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, endereco: e.target.value }))}
                      placeholder="Rua, número, bairro, complemento"
                      className="border-orange-200 focus:border-orange-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bairro" className="text-gray-700 font-medium">Bairro *</Label>
                      <Select value={customerData.bairro_id} onValueChange={(value) => setCustomerData(prev => ({ ...prev, bairro_id: value }))}>
                        <SelectTrigger className="border-orange-200 focus:border-orange-400">
                          <SelectValue placeholder="Selecione o bairro" />
                        </SelectTrigger>
                        <SelectContent>
                          {bairros.map((bairro) => (
                            <SelectItem key={bairro.id} value={bairro.id}>
                              {bairro.nome} - {formatCurrency(bairro.taxa_entrega)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="pagamento" className="text-gray-700 font-medium">Forma de Pagamento *</Label>
                      <Select value={customerData.metodo_pagamento_id} onValueChange={(value) => setCustomerData(prev => ({ ...prev, metodo_pagamento_id: value }))}>
                        <SelectTrigger className="border-orange-200 focus:border-orange-400">
                          <SelectValue placeholder="Selecione o pagamento" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.id} value={method.id}>
                              {method.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="observacoes" className="text-gray-700 font-medium">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={customerData.observacoes}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, observacoes: e.target.value }))}
                      placeholder="Observações adicionais (opcional)"
                      rows={3}
                      className="border-orange-200 focus:border-orange-400"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            {cart.length > 0 && (
              <Card className="border-green-200 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatCurrency(getCartTotal())}</span>
                  </div>
                  {getTaxaEntrega() > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Taxa de Entrega</span>
                      <span className="font-semibold">{formatCurrency(getTaxaEntrega())}</span>
                    </div>
                  )}
                  {getTaxaPagamento() > 0 && (
                    <div className="flex justify-between text-gray-700">
                      <span>Taxa de Pagamento</span>
                      <span className="font-semibold">{formatCurrency(getTaxaPagamento())}</span>
                    </div>
                  )}
                  <div className="border-t border-green-200 pt-3 flex justify-between font-bold text-xl">
                    <span className="text-gray-800">Total</span>
                    <span className="text-green-600">{formatCurrency(getFinalTotal())}</span>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 mt-4 py-3 text-lg font-semibold"
                    onClick={handleSubmitOrder}
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Finalizar Pedido
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      {/* Header with Restaurant Info */}
      <div className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 overflow-hidden">
        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSI0Ii8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse"></div>
        </div>
        
        <div className="relative bg-white/95 backdrop-blur-sm shadow-2xl sticky top-0 z-30">
          <div className="container mx-auto px-4 py-8">
            <div className="text-center space-y-6">
              <div className="relative inline-block group">
                <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                <div className="relative">
                  <img 
                    src={restaurantConfig?.logo_url || "/restaurant-logo.jpg"} 
                    alt="Logo" 
                    className="w-28 h-28 object-contain rounded-3xl mx-auto shadow-2xl border-4 border-white transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute -top-3 -right-3 w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-xl animate-bounce">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -left-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <Zap className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg animate-pulse">
                  {restaurantConfig?.nome_restaurante || 'Veneza\'s Lanches'}
                </h1>
                <p className="text-xl text-gray-700 font-semibold">🍔 Sabor que conquista, qualidade que encanta ✨</p>
                
                <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                  {restaurantConfig?.telefone && (
                    <div className="flex items-center gap-3 bg-gradient-to-r from-orange-100 to-red-100 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{restaurantConfig.telefone}</span>
                    </div>
                  )}
                  {restaurantConfig?.endereco && (
                    <div className="flex items-center gap-3 bg-gradient-to-r from-red-100 to-pink-100 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-bold text-gray-800 group-hover:text-red-600 transition-colors">{restaurantConfig.endereco}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      {restaurantConfig?.banner_url && (
        <div className="relative h-64 overflow-hidden">
          <img 
            src={restaurantConfig.banner_url} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-bold mb-1">Sabor que conquista!</h2>
            <p className="text-sm opacity-90">Os melhores lanches da região</p>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-gradient-to-r from-white/95 to-orange-50/95 backdrop-blur-sm border-b border-orange-200 sticky top-0 z-20 shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            <div className="flex-1 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
                <Input
                  placeholder="🔍 Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 pr-4 py-3 border-2 border-orange-200 focus:border-orange-400 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg focus:shadow-xl transition-all duration-300 text-lg"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 border-2 border-blue-200 focus:border-blue-400 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 py-3">
                      <Filter className="w-5 h-5 mr-2 text-blue-500" />
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
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-emerald-400 rounded-xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48 border-2 border-green-200 focus:border-green-400 rounded-xl bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 py-3">
                      <Sparkles className="w-5 h-5 mr-2 text-green-500" />
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
          <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
          <Button 
            onClick={() => setShowCart(true)}
            className="relative bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 shadow-2xl hover:shadow-3xl rounded-full w-20 h-20 flex items-center justify-center animate-bounce hover:scale-110 transition-all duration-300"
            size="lg"
          >
            <div className="text-center">
              <ShoppingCart className="w-8 h-8 mx-auto text-white drop-shadow-lg" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xs font-black text-yellow-900">{cart.length}</span>
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
              <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                Cardápio Completo
              </h2>
              <p className="text-gray-600">Deliciosos sabores esperando por você</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredItems.map((item, index) => (
                <Card key={item.id} className="group border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden bg-white/90 backdrop-blur-sm transform hover:-translate-y-2 hover:scale-105" style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
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
                            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-yellow-900 border-0 shadow-xl backdrop-blur-sm">
                              <Star className="w-4 h-4 mr-1 fill-current" />
                              {item.average_rating?.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3">
                          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
                            <Heart className="w-3 h-3 mr-1" />
                            Popular
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-black text-xl text-gray-800 group-hover:text-orange-600 transition-colors duration-300 mb-2">
                            {item.nome}
                          </h3>
                          {item.categoria_nome && (
                            <Badge variant="outline" className="text-sm text-orange-600 border-orange-300 bg-orange-50 font-semibold">
                              {item.categoria_nome}
                            </Badge>
                          )}
                        </div>
                        
                        {item.descricao && (
                          <p className="text-sm text-gray-600 overflow-hidden leading-relaxed" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {item.descricao}
                          </p>
                        )}
                        
                        <div className="flex items-center justify-between pt-4">
                          <div className="text-3xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                            {formatCurrency(item.preco)}
                          </div>
                          <Button 
                            onClick={() => openAdicionaisDialog(item)}
                            className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl px-8 py-3 font-bold hover:scale-105"
                            size="sm"
                          >
                            <Plus className="w-5 h-5 mr-2" />
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
            {categories.map((category) => {
              const categoryItems = filteredItems.filter(item => item.categoria_id === category.id);
              
              if (categoryItems.length === 0) return null;

              return (
                <div key={category.id} className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                      {category.nome}
                    </h2>
                    <div className="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {categoryItems.map((item) => (
                      <Card key={item.id} className="group border-orange-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white/80 backdrop-blur-sm">
                        {item.foto_url && (
                          <div className="relative h-40 overflow-hidden">
                            <img 
                              src={item.foto_url} 
                              alt={item.nome}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute top-2 right-2">
                              {item.total_ratings > 0 && (
                                <Badge className="bg-yellow-400 text-yellow-900 border-0 shadow-lg">
                                  <Star className="w-3 h-3 mr-1 fill-current" />
                                  {item.average_rating?.toFixed(1)}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                        
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors">
                                {item.nome}
                              </h3>
                            </div>
                            
                            {item.descricao && (
                              <p className="text-sm text-gray-600 overflow-hidden" style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical'
                              }}>
                                {item.descricao}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between pt-2">
                              <div className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                {formatCurrency(item.preco)}
                              </div>
                              <Button 
                                onClick={() => openAdicionaisDialog(item)}
                                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-full px-6"
                                size="sm"
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Adicionar
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">Nenhum item encontrado</h3>
            <p className="text-gray-500">Tente ajustar os filtros de busca</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 text-white mt-20 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] animate-pulse"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16 text-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-4xl font-black drop-shadow-lg">🍔 Veneza's Lanches</h3>
              <p className="text-xl text-orange-100 font-semibold">✨ Sabor que conquista, qualidade que encanta ✨</p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-orange-100">
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300 group">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Phone className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg">{restaurantConfig?.telefone || '(31) 99549-2713'}</span>
              </div>
              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg hover:bg-white/20 transition-all duration-300 group">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg">{restaurantConfig?.endereco || 'Rua Laguna, 145A - Veneza'}</span>
              </div>
            </div>
            
            <div className="pt-8 border-t border-orange-400/30">
              <p className="text-orange-200 font-medium">
                © 2024 Veneza's Lanches. Todos os direitos reservados. 🎉
              </p>
              <p className="text-orange-300 text-sm mt-2">
                Feito com ❤️ para os amantes da boa comida
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Adicionais */}
      <Dialog open={isAdicionaisDialogOpen} onOpenChange={setIsAdicionaisDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              {selectedItemForAdicionais?.nome}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItemForAdicionais && (
            <div className="space-y-4">
              {/* Debug - Mostrar quantos adicionais foram carregados */}
              <div className="text-xs text-gray-500 text-center">
                Adicionais carregados: {adicionais.length}
              </div>

              {/* Lista de Adicionais */}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {adicionais.length > 0 ? (
                  adicionais.map((adicional) => (
                    <div key={adicional.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={adicional.id}
                          checked={selectedAdicionais.some(sel => sel.id === adicional.id)}
                          onCheckedChange={() => toggleAdicional(adicional)}
                        />
                        <label htmlFor={adicional.id} className="text-sm font-medium cursor-pointer">
                          {adicional.nome}
                        </label>
                      </div>
                      <div className="text-right">
                        {adicional.preco_extra > 0 ? (
                          <span className="text-orange-600 font-semibold text-sm">
                            +{formatCurrency(adicional.preco_extra)}
                          </span>
                        ) : (
                          <span className="text-gray-500 text-xs">Grátis</span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum adicional encontrado</p>
                    <Button 
                      onClick={() => {
                        const localAdicionais = getLocalAdicionais();
                        setAdicionais(localAdicionais);
                        console.log('Carregando adicionais manualmente:', localAdicionais.length);
                      }}
                      size="sm"
                      className="mt-2"
                    >
                      Carregar Adicionais
                    </Button>
                  </div>
                )}
              </div>

              {/* Contador de quantidade do item principal */}
              <div className="flex items-center justify-center space-x-4 py-4 border-t">
                <Button
                  onClick={() => {
                    // Implementar lógica de quantidade se necessário
                  }}
                  variant="outline"
                  size="sm"
                >
                  -
                </Button>
                <span className="text-lg font-semibold">1</span>
                <Button
                  onClick={() => {
                    // Implementar lógica de quantidade se necessário
                  }}
                  variant="outline"
                  size="sm"
                >
                  +
                </Button>
              </div>

              {/* Botão de adicionar */}
              <div className="flex justify-center">
                <Button
                  onClick={addToCartWithAdicionais}
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg font-bold"
                >
                  Adicionar ({formatCurrency(selectedItemForAdicionais.preco + selectedAdicionais.reduce((total, adicional) => total + adicional.preco_extra, 0))})
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}