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

const IndexSimple = () => {
  const [restaurantConfig, setRestaurantConfig] = useState<RestaurantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🚀 IndexSimple: Iniciando carregamento...');
    fetchRestaurantConfig();
  }, []);

  const fetchRestaurantConfig = async () => {
    try {
      console.log('🔍 IndexSimple: Buscando configurações...');
      
      // Força uma nova consulta sem cache
      const { data, error } = await supabase
        .from('restaurant_config')
        .select('*')
        .single();

      console.log('📊 IndexSimple: Resultado:', { data, error });

      if (error) {
        console.error('❌ IndexSimple: Erro:', error);
        setError(`Erro: ${error.message}`);
        
        // Tentar sem .single()
        const { data: allData, error: allError } = await supabase
          .from('restaurant_config')
          .select('*');
        
        console.log('🔄 IndexSimple: Tentativa sem single:', { allData, allError });
        
        if (allError) {
          setError(`Erro sem single: ${allError.message}`);
        } else if (allData && allData.length > 0) {
          console.log('✅ IndexSimple: Usando primeiro item:', allData[0]);
          setRestaurantConfig(allData[0]);
          setError(null);
        } else {
          setError('Nenhum dado encontrado');
        }
      } else {
        console.log('✅ IndexSimple: Sucesso!', data);
        setRestaurantConfig(data);
        setError(null);
      }
    } catch (err) {
      console.error('💥 IndexSimple: Erro inesperado:', err);
      setError(`Erro inesperado: ${err}`);
    } finally {
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
          <p className="text-lg text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Debug Info - Sempre visível */}
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 m-4 rounded">
        <strong>🔧 DEBUG IndexSimple:</strong>
        <div className="mt-2 text-sm">
          <div>Loading: {loading ? 'Sim' : 'Não'}</div>
          <div>Error: {error || 'Nenhum'}</div>
          <div>Config carregada: {restaurantConfig ? 'Sim' : 'Não'}</div>
          {restaurantConfig && (
            <>
              <div>Nome: {restaurantConfig.nome_restaurante}</div>
              <div>Slogan: {restaurantConfig.slogan}</div>
              <div>Logo URL: {restaurantConfig.logo_url}</div>
              <div>Endereço: {restaurantConfig.endereco}</div>
              <div>Telefone: {restaurantConfig.telefone}</div>
            </>
          )}
        </div>
      </div>
      
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
                <Link to="/dashboard">
                  Acesso ao Sistema
                </Link>
              </Button>
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

export default IndexSimple;
