import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Sparkles
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

interface CartItem extends MenuItem {
  quantidade: number;
  observacoes?: string;
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

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantidade: cartItem.quantidade + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantidade: 1 }];
    });
    
    toast({
      title: "Item adicionado!",
      description: `${item.nome} foi adicionado ao carrinho`,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto animate-pulse">
              <div className="w-8 h-8 bg-white rounded-lg" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-800">Carregando cardápio...</p>
            <p className="text-sm text-gray-600">Preparando os melhores sabores para você</p>
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
                {restaurantConfig?.logo_url && (
                  <img src={restaurantConfig.logo_url} alt="Logo" className="w-12 h-12 object-contain rounded-xl shadow-md" />
                )}
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
      <div className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-30">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-4">
            {restaurantConfig?.logo_url && (
              <div className="relative inline-block">
                <img 
                  src={restaurantConfig.logo_url} 
                  alt="Logo" 
                  className="w-24 h-24 object-contain rounded-2xl mx-auto shadow-xl border-4 border-white"
                />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <Award className="w-4 h-4 text-white" />
                </div>
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                {restaurantConfig?.nome_restaurante || 'Veneza\'s Lanches'}
              </h1>
              <div className="flex items-center justify-center gap-6 mt-3 text-gray-600">
                {restaurantConfig?.telefone && (
                  <div className="flex items-center gap-2 bg-orange-100 px-3 py-1 rounded-full">
                    <Phone className="w-4 h-4 text-orange-600" />
                    <span className="font-medium">{restaurantConfig.telefone}</span>
                  </div>
                )}
                {restaurantConfig?.endereco && (
                  <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span className="font-medium">{restaurantConfig.endereco}</span>
                  </div>
                )}
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
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-100 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-orange-200 focus:border-orange-400"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 border-orange-200">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 border-orange-200">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome A-Z</SelectItem>
                  <SelectItem value="price-low">Menor Preço</SelectItem>
                  <SelectItem value="price-high">Maior Preço</SelectItem>
                  <SelectItem value="rating">Melhor Avaliado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button 
            onClick={() => setShowCart(true)}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-2xl hover:shadow-2xl rounded-full w-16 h-16 flex items-center justify-center animate-bounce"
            size="lg"
          >
            <div className="text-center">
              <ShoppingCart className="w-6 h-6 mx-auto text-white" />
              <span className="text-xs font-bold text-white">{cart.length}</span>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
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
                        {item.categoria_nome && (
                          <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                            {item.categoria_nome}
                          </Badge>
                        )}
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
                          onClick={() => addToCart(item)}
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
                                onClick={() => addToCart(item)}
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
      <footer className="bg-gradient-to-r from-orange-600 to-red-600 text-white mt-16">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Veneza's Lanches</h3>
            <p className="text-orange-100">Sabor que conquista, qualidade que encanta</p>
            <div className="flex justify-center gap-6 text-orange-100">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{restaurantConfig?.telefone || '(31) 99549-2713'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{restaurantConfig?.endereco || 'Rua Laguna, 145A - Veneza'}</span>
              </div>
            </div>
            <p className="text-sm text-orange-200 pt-4 border-t border-orange-400">
              © 2024 Veneza's Lanches. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}