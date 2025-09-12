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
    navigate('/auth');
  };

  const toggleAdminButton = () => {
    setShowAdminButton(!showAdminButton);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20" />
        
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-8">
            {/* Logo and Brand */}
            <div className="space-y-4">
              <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-2xl">
                <img 
                  src="/lovable-uploads/venezas-logo.png" 
                  alt="Veneza's Lanches" 
                  className="w-24 h-24 object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const fallback = document.createElement('div');
                    fallback.innerHTML = '<svg class="w-16 h-16 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.2 3.2c-.8-.8-2-.8-2.8 0L3.2 7.4c-.8.8-.8 2 0 2.8l4.2 4.2c.8.8 2 .8 2.8 0l4.2-4.2c.8-.8.8-2 0-2.8L10.2 3.2z"/><path d="M8 6h4v2H8V6zM8 10h4v2H8v-2z"/></svg>';
                    e.currentTarget.parentElement?.appendChild(fallback);
                  }}
                />
              </div>
              
              <div>
                <h1 className="text-6xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  Veneza's Lanches
                </h1>
                <p className="text-xl text-muted-foreground">
                  Sabores únicos que conquistam o seu paladar
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button 
                onClick={handleMenuClick}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white text-xl px-12 py-6 h-auto rounded-xl shadow-2xl transform transition-all duration-300 hover:scale-105"
              >
                <MenuIcon className="mr-3 h-6 w-6" />
                Ver Cardápio Completo
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Confira nossos deliciosos lanches e faça seu pedido!
              </div>
            </div>

            {/* Restaurant Info */}
            <Card className="max-w-2xl mx-auto border-border shadow-elegant animate-fade-in">
              <CardContent className="p-8 space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-orange-500" />
                    <div className="text-left">
                      <p className="font-semibold">Endereço</p>
                      <p className="text-sm text-muted-foreground">Rua das Delícias, 123</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-orange-500" />
                    <div className="text-left">
                      <p className="font-semibold">Telefone</p>
                      <p className="text-sm text-muted-foreground">(31) 99999-9999</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                    <div className="text-left">
                      <p className="font-semibold">Horário</p>
                      <p className="text-sm text-muted-foreground">18:00 - 23:00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Highlights Section */}
      <section className="py-16 bg-background/50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Por que escolher o Veneza's?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8 space-y-4">
                <ChefHat className="h-16 w-16 mx-auto text-orange-500" />
                <h3 className="text-xl font-bold">Ingredientes Frescos</h3>
                <p className="text-muted-foreground">
                  Utilizamos apenas ingredientes selecionados e frescos para garantir o melhor sabor.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8 space-y-4">
                <Star className="h-16 w-16 mx-auto text-orange-500" />
                <h3 className="text-xl font-bold">Qualidade Premium</h3>
                <p className="text-muted-foreground">
                  Receitas exclusivas desenvolvidas com paixão e dedicação para sua satisfação.
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8 space-y-4">
                <Clock className="h-16 w-16 mx-auto text-orange-500" />
                <h3 className="text-xl font-bold">Entrega Rápida</h3>
                <p className="text-muted-foreground">
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
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
              Nossos Favoritos
            </h2>
            <p className="text-xl text-muted-foreground">
              Os lanches mais pedidos pelos nossos clientes
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <img 
                  src="/src/assets/smash-burger.jpg" 
                  alt="Smash Clássico" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.innerHTML = '<div class="flex items-center justify-center w-full h-full"><ChefHat class="h-16 w-16 text-orange-500" /></div>';
                    e.currentTarget.parentElement?.appendChild(placeholder);
                  }}
                />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">Smash Clássico</h3>
                  <Badge className="bg-success/10 text-success">
                    <Star className="h-3 w-3 mr-1" />
                    4.9
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">
                  Hambúrguer artesanal bovino esmagado na chapa com queijo no pão brioche.
                </p>
                <p className="text-2xl font-bold text-primary">R$ 18,00</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <img 
                  src="/src/assets/bacon-cheddar-burger.jpg" 
                  alt="X Tudo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.innerHTML = '<div class="flex items-center justify-center w-full h-full"><ChefHat class="h-16 w-16 text-orange-500" /></div>';
                    e.currentTarget.parentElement?.appendChild(placeholder);
                  }}
                />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">X Tudo</h3>
                  <Badge className="bg-success/10 text-success">
                    <Star className="h-3 w-3 mr-1" />
                    4.8
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">
                  O campeão de vendas com bife, ovo, mussarela, presunto e bacon.
                </p>
                <p className="text-2xl font-bold text-primary">R$ 23,00</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:scale-105">
              <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
                <img 
                  src="/src/assets/acai-bowl.jpg" 
                  alt="Açaí no Copo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    const placeholder = document.createElement('div');
                    placeholder.innerHTML = '<div class="flex items-center justify-center w-full h-full"><ChefHat class="h-16 w-16 text-orange-500" /></div>';
                    e.currentTarget.parentElement?.appendChild(placeholder);
                  }}
                />
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold">Açaí no Copo</h3>
                  <Badge className="bg-success/10 text-success">
                    <Star className="h-3 w-3 mr-1" />
                    4.7
                  </Badge>
                </div>
                <p className="text-muted-foreground mb-3">
                  200ml de açaí puro com fios de leite condensado cremoso.
                </p>
                <p className="text-2xl font-bold text-primary">R$ 10,00</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Button 
              onClick={handleMenuClick}
              variant="outline" 
              className="text-lg px-8 py-4 h-auto"
            >
              Ver Cardápio Completo
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
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