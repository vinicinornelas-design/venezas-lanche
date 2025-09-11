import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Clock, 
  Phone, 
  MapPin,
  Save,
  Upload,
  Image as ImageIcon
} from "lucide-react";

interface RestaurantConfig {
  id: string;
  nome_restaurante: string;
  endereco: string;
  telefone: string;
  horario_funcionamento: any;
  logo_url?: string;
  banner_url?: string;
}

const diasSemana = [
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca', label: 'Terça-feira' },
  { key: 'quarta', label: 'Quarta-feira' },
  { key: 'quinta', label: 'Quinta-feira' },
  { key: 'sexta', label: 'Sexta-feira' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' }
];

export default function ConfiguracaoRestaurante() {
  const [config, setConfig] = useState<RestaurantConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRestaurantConfig();
  }, []);

  const fetchRestaurantConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('restaurant_config')
        .select('*')
        .single();

      if (error) {
        // Se não existir configuração, criar uma padrão
        if (error.code === 'PGRST116') {
          const { data: newConfig, error: insertError } = await supabase
            .from('restaurant_config')
            .insert({
              nome_restaurante: 'Minha Hamburgueria',
              endereco: 'Rua dos Sabores, 123',
              telefone: '(31) 99999-9999',
              horario_funcionamento: {
                segunda: "18:00-23:00",
                terca: "18:00-23:00",
                quarta: "18:00-23:00",
                quinta: "18:00-23:00",
                sexta: "18:00-00:00",
                sabado: "18:00-00:00",
                domingo: "18:00-23:00"
              }
            })
            .select()
            .single();

          if (insertError) throw insertError;
          setConfig(newConfig);
        } else {
          throw error;
        }
      } else {
        setConfig(data);
      }
    } catch (error) {
      console.error('Error fetching restaurant config:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do restaurante",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('restaurant_config')
        .update({
          nome_restaurante: config.nome_restaurante,
          endereco: config.endereco,
          telefone: config.telefone,
          horario_funcionamento: config.horario_funcionamento,
          logo_url: config.logo_url,
          banner_url: config.banner_url
        })
        .eq('id', config.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      });
    } catch (error) {
      console.error('Error saving config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (field: string, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const updateHorario = (dia: string, horario: string) => {
    if (!config) return;
    setConfig({
      ...config,
      horario_funcionamento: {
        ...config.horario_funcionamento,
        [dia]: horario
      }
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Configurações do Restaurante</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!config) return null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Configurações do Restaurante
          </h1>
          <p className="text-muted-foreground">
            Gerencie as informações básicas do seu estabelecimento
          </p>
        </div>
        <Button 
          onClick={saveConfig} 
          disabled={saving}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Informações Básicas */}
        <Card className="border-l-4 border-l-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-orange-600" />
              Informações Básicas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Nome do Restaurante</Label>
                <Input
                  value={config.nome_restaurante}
                  onChange={(e) => updateConfig('nome_restaurante', e.target.value)}
                  placeholder="Ex: Hamburgueria do João"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={config.telefone}
                  onChange={(e) => updateConfig('telefone', e.target.value)}
                  placeholder="(31) 99999-9999"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Endereço Completo</Label>
              <Textarea
                value={config.endereco}
                onChange={(e) => updateConfig('endereco', e.target.value)}
                placeholder="Rua dos Sabores, 123 - Centro, Belo Horizonte - MG"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Horário de Funcionamento */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Horário de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {diasSemana.map((dia) => (
                <div key={dia.key} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium">
                    {dia.label}
                  </div>
                  <Input
                    value={config.horario_funcionamento[dia.key] || ''}
                    onChange={(e) => updateHorario(dia.key, e.target.value)}
                    placeholder="18:00-23:00"
                    className="max-w-xs"
                  />
                  <span className="text-xs text-muted-foreground">
                    Ex: 18:00-23:00 ou "Fechado"
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Imagens */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-purple-600" />
              Imagens do Restaurante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label>Logo do Restaurante</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  {config.logo_url ? (
                    <div className="text-center">
                      <img 
                        src={config.logo_url} 
                        alt="Logo" 
                        className="mx-auto max-h-24 object-contain mb-2"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Alterar Logo
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                    </div>
                  )}
                </div>
                <Input
                  value={config.logo_url || ''}
                  onChange={(e) => updateConfig('logo_url', e.target.value)}
                  placeholder="URL da logo (opcional)"
                />
              </div>

              <div className="space-y-4">
                <Label>Banner/Capa</Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                  {config.banner_url ? (
                    <div className="text-center">
                      <img 
                        src={config.banner_url} 
                        alt="Banner" 
                        className="mx-auto max-h-24 object-cover w-full rounded mb-2"
                      />
                      <Button variant="outline" size="sm">
                        <Upload className="h-4 w-4 mr-2" />
                        Alterar Banner
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Banner
                      </Button>
                    </div>
                  )}
                </div>
                <Input
                  value={config.banner_url || ''}
                  onChange={(e) => updateConfig('banner_url', e.target.value)}
                  placeholder="URL do banner (opcional)"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Preview das Informações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-lg">
              <div className="text-center space-y-2">
                {config.logo_url && (
                  <img 
                    src={config.logo_url} 
                    alt="Logo" 
                    className="mx-auto h-16 object-contain"
                  />
                )}
                <h2 className="text-xl font-bold text-orange-800">
                  {config.nome_restaurante}
                </h2>
                <p className="text-orange-700 flex items-center justify-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {config.endereco}
                </p>
                <p className="text-orange-700 flex items-center justify-center gap-1">
                  <Phone className="h-4 w-4" />
                  {config.telefone}
                </p>
                <div className="text-sm text-orange-600 mt-4">
                  <p className="font-medium mb-2">Horário de Funcionamento:</p>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    {diasSemana.map((dia) => (
                      <div key={dia.key} className="flex justify-between">
                        <span>{dia.label.slice(0, 3)}:</span>
                        <span>{config.horario_funcionamento[dia.key] || 'Fechado'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}