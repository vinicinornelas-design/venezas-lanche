import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, 
  Phone, 
  MapPin, 
  Clock, 
  Save,
  Image as ImageIcon
} from "lucide-react";

interface RestaurantConfig {
  id: string;
  nome_restaurante: string;
  telefone: string;
  endereco: string;
  logo_url: string;
  banner_url: string;
  horario_funcionamento: {
    [key: string]: string;
  };
}

const DAYS_OF_WEEK = [
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca', label: 'Terça-feira' },
  { key: 'quarta', label: 'Quarta-feira' },
  { key: 'quinta', label: 'Quinta-feira' },
  { key: 'sexta', label: 'Sexta-feira' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' }
];

export default function Restaurante() {
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
        // Se não existe configuração, criar uma default
        if (error.code === 'PGRST116') {
          await createDefaultConfig();
          return;
        }
        throw error;
      }
      
      if (data) setConfig({
        ...data,
        horario_funcionamento: data.horario_funcionamento as { [key: string]: string }
      });
    } catch (error) {
      console.error('Error fetching restaurant config:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultConfig = async () => {
    try {
      const defaultConfig = {
        nome_restaurante: 'Veneza\'s Lanches',
        telefone: '(31) 99999-0000',
        endereco: 'Rua das Palmeiras, 456 - Centro',
        logo_url: '',
        banner_url: '',
        horario_funcionamento: {
          segunda: '17:00-23:00',
          terca: '17:00-23:00',
          quarta: '17:00-23:00',
          quinta: '17:00-23:00',
          sexta: '17:00-00:00',
          sabado: '17:00-00:00',
          domingo: '17:00-23:00'
        }
      };

      const { data, error } = await supabase
        .from('restaurant_config')
        .insert(defaultConfig)
        .select()
        .single();

      if (error) throw error;
      if (data) setConfig({
        ...data,
        horario_funcionamento: data.horario_funcionamento as { [key: string]: string }
      });
    } catch (error) {
      console.error('Error creating default config:', error);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('restaurant_config')
        .update({
          nome_restaurante: config.nome_restaurante,
          telefone: config.telefone,
          endereco: config.endereco,
          logo_url: config.logo_url,
          banner_url: config.banner_url,
          horario_funcionamento: config.horario_funcionamento
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
    setConfig(prev => prev ? { ...prev, [field]: value } : null);
  };

  const updateHorario = (day: string, horario: string) => {
    if (!config) return;
    setConfig(prev => prev ? {
      ...prev,
      horario_funcionamento: {
        ...prev.horario_funcionamento,
        [day]: horario
      }
    } : null);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Configurações do Restaurante</h1>
          <p className="text-muted-foreground">Gerencie as informações do seu estabelecimento</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Configurações do Restaurante</h1>
          <p className="text-muted-foreground">Erro ao carregar configurações</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Configurações do Restaurante</h1>
          <p className="text-muted-foreground">
            Gerencie as informações e configurações do seu estabelecimento
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </div>

      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Informações Básicas
          </CardTitle>
          <CardDescription>
            Informações principais do restaurante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Restaurante</Label>
              <Input
                id="nome"
                value={config.nome_restaurante}
                onChange={(e) => updateConfig('nome_restaurante', e.target.value)}
                placeholder="Nome do seu restaurante"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={config.telefone}
                onChange={(e) => updateConfig('telefone', e.target.value)}
                placeholder="(31) 99999-9999"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço Completo</Label>
            <Textarea
              id="endereco"
              value={config.endereco}
              onChange={(e) => updateConfig('endereco', e.target.value)}
              placeholder="Rua, número, bairro, cidade - CEP"
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Imagens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Imagens
          </CardTitle>
          <CardDescription>
            URLs das imagens do restaurante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="logo">URL do Logo</Label>
              <Input
                id="logo"
                value={config.logo_url}
                onChange={(e) => updateConfig('logo_url', e.target.value)}
                placeholder="https://exemplo.com/logo.png"
              />
              {config.logo_url && (
                <div className="mt-2">
                  <img 
                    src={config.logo_url} 
                    alt="Logo preview" 
                    className="h-16 w-16 object-contain border rounded"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="banner">URL do Banner</Label>
              <Input
                id="banner"
                value={config.banner_url}
                onChange={(e) => updateConfig('banner_url', e.target.value)}
                placeholder="https://exemplo.com/banner.jpg"
              />
              {config.banner_url && (
                <div className="mt-2">
                  <img 
                    src={config.banner_url} 
                    alt="Banner preview" 
                    className="h-16 w-32 object-cover border rounded"
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horário de Funcionamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Horário de Funcionamento
          </CardTitle>
          <CardDescription>
            Configure os horários de abertura e fechamento para cada dia da semana
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS_OF_WEEK.map((day) => (
              <div key={day.key} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Label className="font-medium w-32">{day.label}</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    value={config.horario_funcionamento[day.key] || ''}
                    onChange={(e) => updateHorario(day.key, e.target.value)}
                    placeholder="17:00-23:00"
                    className="w-32"
                  />
                  <span className="text-sm text-muted-foreground">
                    (ex: 17:00-23:00 ou "Fechado")
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Dica:</strong> Use o formato "HH:MM-HH:MM" para horários (ex: 17:00-23:00) 
              ou escreva "Fechado" para dias que não funcionam.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Preview das Informações</CardTitle>
          <CardDescription>Como as informações aparecerão para os clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-6 bg-gradient-subtle">
            <div className="flex items-center gap-4 mb-4">
              {config.logo_url && (
                <img 
                  src={config.logo_url} 
                  alt="Logo" 
                  className="h-16 w-16 object-contain"
                />
              )}
              <div>
                <h2 className="text-2xl font-bold">{config.nome_restaurante}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <div className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {config.telefone}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {config.endereco}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.key} className="flex justify-between">
                  <span className="font-medium">{day.label.substring(0, 3)}:</span>
                  <span>{config.horario_funcionamento[day.key] || 'Não definido'}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}