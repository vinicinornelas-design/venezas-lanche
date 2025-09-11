import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Settings, 
  Truck, 
  CreditCard, 
  Bell, 
  Shield,
  Save,
  RefreshCw
} from "lucide-react";

interface Configuracao {
  chave: string;
  valor: any;
}

interface ConfiguracoesData {
  taxa_entrega_padrao: number;
  taxa_cartao_credito: number;
  taxa_cartao_debito: number;
  notificacoes_whatsapp: boolean;
  notificacoes_email: boolean;
  pedido_minimo_delivery: number;
  tempo_preparo_padrao: number;
  aceita_dinheiro_troco: boolean;
  limite_tempo_cancelamento: number;
}

const DEFAULT_CONFIG: ConfiguracoesData = {
  taxa_entrega_padrao: 5.0,
  taxa_cartao_credito: 3.5,
  taxa_cartao_debito: 2.5,
  notificacoes_whatsapp: true,
  notificacoes_email: false,
  pedido_minimo_delivery: 15.0,
  tempo_preparo_padrao: 30,
  aceita_dinheiro_troco: true,
  limite_tempo_cancelamento: 10
};

export default function Configuracoes() {
  const [config, setConfig] = useState<ConfiguracoesData>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfiguracoes();
  }, []);

  const fetchConfiguracoes = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*');

      if (error) throw error;

      if (data && data.length > 0) {
        const configData = { ...DEFAULT_CONFIG };
        data.forEach((item: Configuracao) => {
          if (item.chave in configData) {
            (configData as any)[item.chave] = item.valor;
          }
        });
        setConfig(configData);
      }
    } catch (error) {
      console.error('Error fetching configurations:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Deletar configurações existentes e inserir as novas
      await supabase.from('configuracoes').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const configEntries = Object.entries(config).map(([chave, valor]) => ({
        chave,
        valor
      }));

      const { error } = await supabase
        .from('configuracoes')
        .insert(configEntries);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso",
      });
    } catch (error) {
      console.error('Error saving configurations:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateConfig = (key: keyof ConfiguracoesData, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const resetToDefaults = () => {
    setConfig(DEFAULT_CONFIG);
    toast({
      title: "Configurações resetadas",
      description: "Todas as configurações foram restauradas para os valores padrão",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Configurações Gerais</h1>
          <p className="text-muted-foreground">Configurações gerais do sistema</p>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Configurações Gerais</h1>
          <p className="text-muted-foreground">
            Configure as opções gerais do sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Salvando...' : 'Salvar'}
          </Button>
        </div>
      </div>

      {/* Configurações de Entrega */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Configurações de Entrega
          </CardTitle>
          <CardDescription>
            Defina as configurações relacionadas ao delivery
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxa_entrega">Taxa de Entrega Padrão (R$)</Label>
              <Input
                id="taxa_entrega"
                type="number"
                step="0.01"
                value={config.taxa_entrega_padrao}
                onChange={(e) => updateConfig('taxa_entrega_padrao', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pedido_minimo">Pedido Mínimo para Delivery (R$)</Label>
              <Input
                id="pedido_minimo"
                type="number"
                step="0.01"
                value={config.pedido_minimo_delivery}
                onChange={(e) => updateConfig('pedido_minimo_delivery', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tempo_preparo">Tempo de Preparo Padrão (minutos)</Label>
            <Input
              id="tempo_preparo"
              type="number"
              value={config.tempo_preparo_padrao}
              onChange={(e) => updateConfig('tempo_preparo_padrao', parseInt(e.target.value) || 0)}
              className="w-48"
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Pagamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Configurações de Pagamento
          </CardTitle>
          <CardDescription>
            Configure as taxas e opções de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taxa_credito">Taxa Cartão de Crédito (%)</Label>
              <Input
                id="taxa_credito"
                type="number"
                step="0.01"
                value={config.taxa_cartao_credito}
                onChange={(e) => updateConfig('taxa_cartao_credito', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taxa_debito">Taxa Cartão de Débito (%)</Label>
              <Input
                id="taxa_debito"
                type="number"
                step="0.01"
                value={config.taxa_cartao_debito}
                onChange={(e) => updateConfig('taxa_cartao_debito', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Aceitar Dinheiro com Troco</Label>
              <p className="text-sm text-muted-foreground">
                Permitir pagamento em dinheiro com necessidade de troco
              </p>
            </div>
            <Switch
              checked={config.aceita_dinheiro_troco}
              onCheckedChange={(checked) => updateConfig('aceita_dinheiro_troco', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notificações
          </CardTitle>
          <CardDescription>
            Configure como e quando receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Receber notificações de novos pedidos via WhatsApp
              </p>
            </div>
            <Switch
              checked={config.notificacoes_whatsapp}
              onCheckedChange={(checked) => updateConfig('notificacoes_whatsapp', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Notificações Email</Label>
              <p className="text-sm text-muted-foreground">
                Receber relatórios diários por email
              </p>
            </div>
            <Switch
              checked={config.notificacoes_email}
              onCheckedChange={(checked) => updateConfig('notificacoes_email', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Segurança */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança e Controle
          </CardTitle>
          <CardDescription>
            Configurações de segurança e controle do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="limite_cancelamento">
              Limite para Cancelamento (minutos após o pedido)
            </Label>
            <Input
              id="limite_cancelamento"
              type="number"
              value={config.limite_tempo_cancelamento}
              onChange={(e) => updateConfig('limite_tempo_cancelamento', parseInt(e.target.value) || 0)}
              className="w-48"
            />
            <p className="text-sm text-muted-foreground">
              Tempo limite em que clientes podem cancelar pedidos automaticamente
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resumo das Configurações */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo das Configurações</CardTitle>
          <CardDescription>Visualização das configurações atuais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Taxa de Entrega</p>
              <p className="text-2xl font-bold text-primary">
                R$ {config.taxa_entrega_padrao.toFixed(2)}
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Pedido Mínimo</p>
              <p className="text-2xl font-bold text-accent">
                R$ {config.pedido_minimo_delivery.toFixed(2)}
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Tempo de Preparo</p>
              <p className="text-2xl font-bold text-success">
                {config.tempo_preparo_padrao} min
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Taxa Crédito</p>
              <p className="text-2xl font-bold text-warning">
                {config.taxa_cartao_credito}%
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Taxa Débito</p>
              <p className="text-2xl font-bold text-warning">
                {config.taxa_cartao_debito}%
              </p>
            </div>
            <div className="p-3 border rounded-lg">
              <p className="font-medium">Limite Cancelamento</p>
              <p className="text-2xl font-bold text-destructive">
                {config.limite_tempo_cancelamento} min
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}