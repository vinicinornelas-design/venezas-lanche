import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ShoppingCart, Users, Clock, MapPin, BarChart3, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              LancheFlow
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sistema completo de gestão para hamburgueria
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Bem-vindo ao nosso restaurante! Confira nosso cardápio completo abaixo.
            </p>
            <Button asChild variant="outline" size="lg" className="border-orange-300 text-orange-700 hover:bg-orange-50 bg-white mt-4">
              <Link to="/menu">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ver Cardápio Completo
              </Link>
            </Button>
            <div className="mt-8">
              <Button asChild size="sm" variant="ghost" className="text-xs text-muted-foreground hover:text-foreground">
                <Link to="/dashboard">
                  Acesso ao Sistema
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200">
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-orange-800 mb-2">Gestão de Funcionários</h3>
              <p className="text-orange-700">Controle completo da equipe e permissões por cargo</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
              <BarChart3 className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-blue-800 mb-2">Relatórios e Analytics</h3>
              <p className="text-blue-700">Acompanhe vendas, faturamento e performance em tempo real</p>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <MessageSquare className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">Remarketing Inteligente</h3>
              <p className="text-green-700">Reconquiste clientes perdidos com campanhas personalizadas</p>
            </div>
          </div>
        </div>

        {/* Informações do Restaurante */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card className="border-l-4 border-l-orange-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-orange-800">Lanches Artesanais</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-orange-700">
                Hambúrgueres feitos com ingredientes frescos e selecionados.
                Do clássico X-Salada ao completo X-Tudo!
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-blue-800">Horário de Funcionamento</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-blue-700">
                Segunda a Quinta: 17h às 23h<br/>
                Sexta e Sábado: 17h à 00h<br/>
                Domingo: 17h às 23h
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="text-center">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-green-800">Localização</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center text-green-700">
                Rua das Palmeiras, 456 - Centro<br/>
                Entregamos nos principais bairros da cidade<br/>
                Tel: (31) 99999-0000
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-orange-500/10 to-red-500/10 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            LancheFlow - Sistema de Gestão para Hamburgueria
          </p>
          <p className="text-sm mt-2 text-muted-foreground">
            Controle total do seu negócio em uma plataforma completa
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
