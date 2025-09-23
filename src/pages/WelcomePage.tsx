import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ChefHat, 
  MapPin, 
  Phone, 
  Clock, 
  Star,
  Menu as MenuIcon,
  ArrowRight,
  Shield
} from "lucide-react";

export default function WelcomePage() {
  const navigate = useNavigate();
  const [showAdminButton, setShowAdminButton] = useState(false);

  const handleMenuClick = () => {
    navigate('/menu-publico');
  };

  const handleAdminClick = () => {
    navigate('/dashboard');
  };

  const toggleAdminButton = () => {
    setShowAdminButton(!showAdminButton);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-red-500/20" />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            {/* Logo and Brand */}
            <div className="space-y-6">
              {/* Logo Principal */}
              <div className="relative">
                <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-red-500 flex items-center justify-center shadow-2xl">
                  <img 
                    src="/venezas-logo.png" 
                    alt="Veneza's Lanches" 
                    className="w-24 h-24 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const fallback = document.createElement('div');
                      fallback.innerHTML = '<div class="w-24 h-24 flex items-center justify-center"><ChefHat class="w-12 h-12 text-white" /></div>';
                      e.currentTarget.parentElement?.appendChild(fallback);
                    }}
                  />
                </div>
              </div>
              
              {/* Nome da Marca */}
              <div className="space-y-3">
                <h1 className="text-5xl sm:text-6xl md:text-7xl font-black bg-gradient-to-r from-amber-500 via-red-500 to-amber-600 bg-clip-text text-transparent mb-2 tracking-tight">
                  VENEZA'S
                </h1>
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-amber-600 bg-clip-text text-transparent mb-2">
                  LANCHES
                </h2>
                <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-amber-500 to-red-500 mx-auto rounded-full"></div>
                <p className="text-lg sm:text-xl text-amber-700 font-medium max-w-2xl mx-auto">
                  Sabores únicos que conquistam o seu paladar
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={handleMenuClick}
                className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white text-xl px-12 py-6 h-auto rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105"
              >
                <MenuIcon className="mr-3 h-6 w-6" />
                Ver Cardápio Completo
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              
              <div className="text-sm text-amber-600">
                Confira nossos deliciosos lanches e faça seu pedido!
              </div>
            </div>

            {/* Restaurant Info */}
            <Card className="max-w-2xl mx-auto border-border shadow-elegant animate-fade-in">
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-amber-500" />
                    <div className="text-left">
                      <p className="font-semibold">Endereço</p>
                      <p className="text-sm text-amber-600">Rua das Delícias, 123</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-amber-500" />
                    <div className="text-left">
                      <p className="font-semibold">Telefone</p>
                      <p className="text-sm text-amber-600">(31) 99999-9999</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-amber-500" />
                    <div className="text-left">
                      <p className="font-semibold">Horário</p>
                      <p className="text-sm text-amber-600">18:00 - 23:00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 bg-gradient-to-b from-amber-50/50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
            Por que escolher o Veneza's?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow border-amber-200">
              <CardContent className="p-8 space-y-4">
                <ChefHat className="h-16 w-16 mx-auto text-amber-500" />
                <h3 className="text-xl font-bold text-amber-900">Ingredientes Frescos</h3>
                <p className="text-amber-700">
                  Utilizamos apenas ingredientes selecionados e frescos para garantir o melhor sabor.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow border-amber-200">
              <CardContent className="p-8 space-y-4">
                <Star className="h-16 w-16 mx-auto text-amber-500" />
                <h3 className="text-xl font-bold text-amber-900">Qualidade Premium</h3>
                <p className="text-amber-700">
                  Receitas exclusivas desenvolvidas com paixão e dedicação para sua satisfação.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow border-amber-200">
              <CardContent className="p-8 space-y-4">
                <Clock className="h-16 w-16 mx-auto text-amber-500" />
                <h3 className="text-xl font-bold text-amber-900">Entrega Rápida</h3>
                <p className="text-amber-700">
                  Preparamos seus pedidos com agilidade para você receber quentinho em casa.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Popular Items Preview */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
              Nossos Favoritos
            </h2>
            <p className="text-xl text-amber-700">
              Os lanches mais pedidos pelos nossos clientes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-amber-200">
              <div className="aspect-video bg-gradient-to-br from-amber-100 to-red-100 flex items-center justify-center">
                <img 
                  src="/src/assets/smash-burger.jpg" 
                  alt="Smash Clássico" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.innerHTML = '<div class="flex items-center justify-center w-full h-full"><ChefHat class="h-16 w-16 text-amber-500" /></div>';
                    e.currentTarget.parentElement?.appendChild(placeholder);
                  }}
                />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-amber-900">Smash Clássico</h3>
                  <Badge className="bg-gradient-to-r from-amber-100 to-red-100 text-amber-800 border-amber-300">
                    <Star className="h-3 w-3 mr-1" />
                    4.9
                  </Badge>
                </div>
                <p className="text-amber-700 mb-3">
                  Hambúrguer artesanal bovino esmagado na chapa com queijo no pão brioche.
                </p>
                <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">R$ 18,00</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-amber-200">
              <div className="aspect-video bg-gradient-to-br from-amber-100 to-red-100 flex items-center justify-center">
                <img 
                  src="/src/assets/bacon-cheddar-burger.jpg" 
                  alt="X Tudo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.innerHTML = '<div class="flex items-center justify-center w-full h-full"><ChefHat class="h-16 w-16 text-amber-500" /></div>';
                    e.currentTarget.parentElement?.appendChild(placeholder);
                  }}
                />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-amber-900">X Tudo</h3>
                  <Badge className="bg-gradient-to-r from-amber-100 to-red-100 text-amber-800 border-amber-300">
                    <Star className="h-3 w-3 mr-1" />
                    4.8
                  </Badge>
                </div>
                <p className="text-amber-700 mb-3">
                  O campeão de vendas com bife, ovo, mussarela, presunto e bacon.
                </p>
                <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">R$ 23,00</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105 border-amber-200">
              <div className="aspect-video bg-gradient-to-br from-amber-100 to-red-100 flex items-center justify-center">
                <img 
                  src="/src/assets/acai-bowl.jpg" 
                  alt="Açaí no Copo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.innerHTML = '<div class="flex items-center justify-center w-full h-full"><ChefHat class="h-16 w-16 text-amber-500" /></div>';
                    e.currentTarget.parentElement?.appendChild(placeholder);
                  }}
                />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-amber-900">Açaí no Copo</h3>
                  <Badge className="bg-gradient-to-r from-amber-100 to-red-100 text-amber-800 border-amber-300">
                    <Star className="h-3 w-3 mr-1" />
                    4.7
                  </Badge>
                </div>
                <p className="text-amber-700 mb-3">
                  200ml de açaí puro com fios de leite condensado cremoso.
                </p>
                <p className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">R$ 10,00</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={handleMenuClick}
              variant="outline" 
              className="text-lg px-8 py-4 h-auto border-amber-400 text-amber-600 hover:bg-amber-50"
            >
              Ver Cardápio Completo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-amber-50 to-red-50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <p className="text-amber-700">
              © 2024 Veneza's Lanches. Todos os direitos reservados.
            </p>
            
            {/* Hidden Admin Access */}
            <div className="opacity-30 hover:opacity-100 transition-opacity duration-500">
              <button 
                onClick={toggleAdminButton}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                •
              </button>
              
              {showAdminButton && (
                <div className="mt-2">
                  <Button 
                    onClick={handleAdminClick}
                    variant="ghost" 
                    size="sm"
                    className="text-xs"
                  >
                    <Shield className="mr-1 h-3 w-3" />
                    Acesso ao Sistema
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}