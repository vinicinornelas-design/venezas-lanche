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
  Star
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
  slogan: string | null;
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
      console.log('🔍 MenuPublico: Buscando configurações...');
      
      const { data, error } = await supabase
        .from('restaurant_config')
        .select('*')
        .single();

      console.log('📊 MenuPublico: Resultado:', { data, error });

      if (error) {
        console.error('❌ MenuPublico: Erro:', error);
        
        // Tentar sem .single()
        const { data: allData, error: allError } = await supabase
          .from('restaurant_config')
          .select('*');
        
        console.log('🔄 MenuPublico: Tentativa sem single:', { allData, allError });
        
        if (allError) {
          console.error('❌ MenuPublico: Erro sem single:', allError);
        } else if (allData && allData.length > 0) {
          console.log('✅ MenuPublico: Usando primeiro item:', allData[0]);
          setRestaurantConfig(allData[0]);
        }
      } else {
        console.log('✅ MenuPublico: Sucesso!', data);
        setRestaurantConfig(data);
      }
    } catch (err) {
      console.error('💥 MenuPublico: Erro inesperado:', err);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center mx-auto animate-bounce-subtle">
            <div className="w-4 h-4 bg-white rounded-sm" />
          </div>
          <p className="text-muted-foreground">Carregando cardápio...</p>
        </div>
      </div>
    );
  }

  if (showCart) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {restaurantConfig?.logo_url && (
                  <img src={restaurantConfig.logo_url} alt="Logo" className="w-10 h-10 object-contain rounded-lg" />
                )}
                <h1 className="text-xl font-bold text-foreground">
                  {restaurantConfig?.nome_restaurante || 'Hamburgueria'}
                </h1>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setShowCart(false)}
              >
                Voltar ao Cardápio
              </Button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="space-y-6">
            {/* Cart Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Seus Itens ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{item.nome}</h4>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.preco)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.id, item.quantidade - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center">{item.quantidade}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartItemQuantity(item.id, item.quantidade + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {cart.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Seu carrinho está vazio
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Customer Data Form */}
            {cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Dados de Entrega</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        value={customerData.nome}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, nome: e.target.value }))}
                        placeholder="Seu nome completo"
                      />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        value={customerData.telefone}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, telefone: e.target.value }))}
                        placeholder="(31) 99999-9999"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="endereco">Endereço Completo *</Label>
                    <Input
                      id="endereco"
                      value={customerData.endereco}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, endereco: e.target.value }))}
                      placeholder="Rua, número, bairro, complemento"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bairro">Bairro *</Label>
                      <Select value={customerData.bairro_id} onValueChange={(value) => setCustomerData(prev => ({ ...prev, bairro_id: value }))}>
                        <SelectTrigger>
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
                      <Label htmlFor="pagamento">Forma de Pagamento *</Label>
                      <Select value={customerData.metodo_pagamento_id} onValueChange={(value) => setCustomerData(prev => ({ ...prev, metodo_pagamento_id: value }))}>
                        <SelectTrigger>
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
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={customerData.observacoes}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, observacoes: e.target.value }))}
                      placeholder="Observações adicionais (opcional)"
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Order Summary */}
            {cart.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(getCartTotal())}</span>
                  </div>
                  {getTaxaEntrega() > 0 && (
                    <div className="flex justify-between">
                      <span>Taxa de Entrega</span>
                      <span>{formatCurrency(getTaxaEntrega())}</span>
                    </div>
                  )}
                  {getTaxaPagamento() > 0 && (
                    <div className="flex justify-between">
                      <span>Taxa de Pagamento</span>
                      <span>{formatCurrency(getTaxaPagamento())}</span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatCurrency(getFinalTotal())}</span>
                  </div>
                  
                  <Button 
                    className="w-full gradient-primary shadow-warm hover:shadow-accent mt-4"
                    onClick={handleSubmitOrder}
                  >
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
    <div className="min-h-screen bg-gradient-subtle">
      {/* Debug Info - Sempre visível */}
      <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 m-4 rounded">
        <strong>🔧 DEBUG MenuPublico:</strong>
        <div className="mt-2 text-sm">
          <div>Loading: {loading ? 'Sim' : 'Não'}</div>
          <div>Config carregada: {restaurantConfig ? 'Sim' : 'Não'}</div>
          {restaurantConfig && (
            <>
              <div>Nome: {restaurantConfig.nome_restaurante}</div>
              <div>Slogan: {restaurantConfig.slogan}</div>
              <div>Endereço: {restaurantConfig.endereco}</div>
              <div>Telefone: {restaurantConfig.telefone}</div>
              <div>Logo URL: {restaurantConfig.logo_url}</div>
              <div>Banner URL: {restaurantConfig.banner_url}</div>
            </>
          )}
        </div>
      </div>
      
      {/* Header with Restaurant Info */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center space-y-4">
            {restaurantConfig?.logo_url && (
              <img 
                src={restaurantConfig.logo_url} 
                alt="Logo" 
                className="w-20 h-20 object-contain rounded-2xl mx-auto shadow-warm"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {restaurantConfig?.nome_restaurante || 'Hamburgueria'}
              </h1>
              <div className="flex items-center justify-center gap-4 mt-2 text-muted-foreground">
                {restaurantConfig?.telefone && (
                  <div className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span>{restaurantConfig.telefone}</span>
                  </div>
                )}
                {restaurantConfig?.endereco && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{restaurantConfig.endereco}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      {restaurantConfig?.banner_url && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={restaurantConfig.banner_url} 
            alt="Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>
      )}

      {/* Fixed Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50">
          <Button 
            onClick={() => setShowCart(true)}
            className="gradient-primary shadow-warm hover:shadow-accent rounded-full w-16 h-16 flex items-center justify-center"
            size="lg"
          >
            <div className="text-center">
              <ShoppingCart className="w-6 h-6 mx-auto" />
              <span className="text-xs font-bold">{cart.length}</span>
            </div>
          </Button>
        </div>
      )}

      {/* Menu */}
      <div className="container mx-auto px-4 py-6">
        <div className="space-y-8">
          {categories.map((category) => {
            const categoryItems = menuItems.filter(item => item.categoria_id === category.id);
            
            if (categoryItems.length === 0) return null;

            return (
              <div key={category.id} className="space-y-4">
                <h2 className="text-2xl font-bold text-foreground border-b border-primary pb-2">
                  {category.nome}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryItems.map((item) => (
                    <Card key={item.id} className="border-border shadow-elegant hover:shadow-warm transition-shadow overflow-hidden">
                      {item.foto_url && (
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={item.foto_url} 
                            alt={item.nome}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">{item.nome}</CardTitle>
                          {item.total_ratings > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-medium">{item.average_rating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">({item.total_ratings})</span>
                            </div>
                          )}
                        </div>
                        {item.descricao && (
                          <CardDescription className="text-sm">
                            {item.descricao}
                          </CardDescription>
                        )}
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Rating System Integration */}
                        <RatingSystem 
                          itemId={item.id}
                          itemName={item.nome}
                          customerName={customerData.nome}
                          customerPhone={customerData.telefone}
                          showCompactForm={true}
                          onRatingSubmitted={() => fetchMenuData()}
                        />
                        
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="text-2xl font-bold text-primary">
                            {formatCurrency(item.preco)}
                          </div>
                          <Button 
                            onClick={() => addToCart(item)}
                            className="gradient-primary shadow-warm hover:shadow-accent"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Adicionar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2024 {restaurantConfig?.nome_restaurante || 'Hamburgueria'}. Todos os direitos reservados.</p>
          <p className="text-sm mt-2">Sistema LancheFlow - Gestão de Restaurantes</p>
        </div>
      </footer>
    </div>
  );
}