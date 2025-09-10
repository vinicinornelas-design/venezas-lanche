import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, ShoppingCart, Users, Clock, MapPin, BarChart3, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RestaurantConfig {
  id: string;
  nome_restaurante: string | null;
  endereco: string | null;
  telefone: string | null;
  horario_funcionamento: any;
  logo_url: string | null;
  banner_url: string | null;
  slogan: string | null;
}

const Index = () => {
  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurantConfig();
  }, []);

  const fetchRestaurantConfig = async () => {
    try {
      console.log('=== INÍCIO: Buscando configurações do restaurante ===');
      console.log('Supabase client:', supabase);
      
      const { data, error } = await supabase
        .from('restaurant_config')
        .select('*')
        .single();

      console.log('Resultado da consulta:', { data, error });

      if (error) {
        console.error('❌ Erro ao buscar configurações do restaurante:', error);
        console.log('Tentando buscar sem .single()...');
        
        // Tentar buscar sem .single() para ver se há dados
        const { data: allData, error: allError } = await supabase
          .from('restaurant_config')
          .select('*');
        
        console.log('Resultado da consulta sem single:', { allData, allError });
        
        if (allError) {
          console.error('❌ Erro ao buscar todas as configurações:', allError);
        } else {
          console.log('✅ Dados encontrados (sem single):', allData);
          if (allData && allData.length > 0) {
            console.log('✅ Definindo configuração com primeiro item:', allData[0]);
            setRestaurantConfig(allData[0]);
          } else {
            console.log('⚠️ Nenhum dado encontrado na tabela');
          }
        }
      } else {
        console.log('✅ Configurações carregadas com sucesso:', data);
        console.log('✅ Definindo configuração:', data);
        setRestaurantConfig(data);
      }
    } catch (error) {
      console.error('❌ Erro inesperado:', error);
    } finally {
      console.log('=== FIM: Finalizando carregamento ===');
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto shadow-lg animate-bounce mb-4">
            <ChefHat className="w-10 h-10 text-white" />
          </div>
          <p className="text-lg text-muted-foreground">Carregando informações do restaurante...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Debug Info - Remove em produção */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 m-4 rounded">
          <strong>Debug:</strong> Config carregada: {restaurantConfig ? 'Sim' : 'Não'}
          {restaurantConfig && (
            <div className="mt-2 text-sm">
              <div>Nome: {restaurantConfig.nome_restaurante}</div>
              <div>Slogan: {restaurantConfig.slogan}</div>
              <div>Logo URL: {restaurantConfig.logo_url}</div>
              <div>Banner URL: {restaurantConfig.banner_url}</div>
              <div>Endereço: {restaurantConfig.endereco}</div>
              <div>Telefone: {restaurantConfig.telefone}</div>
              <div>Horário: {JSON.stringify(restaurantConfig.horario_funcionamento)}</div>
            </div>
          )}
        </div>
      )}
      
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            {/* Logo do restaurante ou ícone padrão */}
            {restaurantConfig?.logo_url ? (
              <div className="w-20 h-20 rounded-3xl overflow-hidden mx-auto shadow-lg animate-bounce">
                <img 
                  src={restaurantConfig.logo_url} 
                  alt="Logo do restaurante" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto shadow-lg animate-bounce">
                <ChefHat className="w-10 h-10 text-white" />
              </div>
            )}
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-4">
              {restaurantConfig?.nome_restaurante || 'LancheFlow'}
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              {restaurantConfig?.slogan || 'Sistema completo de gestão para hamburgueria'}
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
                <Link to="/auth">
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
                {restaurantConfig?.horario_funcionamento ? (
                  <div>
                    {typeof restaurantConfig.horario_funcionamento === 'object' ? (
                      Object.entries(restaurantConfig.horario_funcionamento).map(([dia, horario]) => (
                        <div key={dia}>
                          {dia}: {horario as string}
                        </div>
                      ))
                    ) : (
                      restaurantConfig.horario_funcionamento
                    )}
                  </div>
                ) : (
                  <>
                    Segunda a Quinta: 17h às 23h<br/>
                    Sexta e Sábado: 17h à 00h<br/>
                    Domingo: 17h às 23h
                  </>
                )}
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
                {restaurantConfig?.endereco || 'Rua das Palmeiras, 456 - Centro'}<br/>
                Entregamos nos principais bairros da cidade<br/>
                Tel: {restaurantConfig?.telefone || '(31) 99999-0000'}
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-gradient-to-r from-orange-500/10 to-red-500/10 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            {restaurantConfig?.nome_restaurante || 'LancheFlow'} - Sistema de Gestão para Hamburgueria
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
