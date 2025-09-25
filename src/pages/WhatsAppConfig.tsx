import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Settings, 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Smartphone,
  Key,
  Shield,
  Zap,
  Send,
  Eye,
  EyeOff
} from "lucide-react";
import { WhatsAppConfig } from "@/services/whatsappService";

export default function WhatsAppConfig() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showTokens, setShowTokens] = useState(false);
  const [formData, setFormData] = useState({
    phone_number_id: '',
    access_token: '',
    webhook_verify_token: '',
    business_account_id: '',
    enabled: false
  });
  const [testPhone, setTestPhone] = useState('');
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data: restaurant } = await supabase
        .from('restaurant_config')
        .select('id')
        .single();

      if (!restaurant) return;

      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('restaurant_id', restaurant.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
        setFormData({
          phone_number_id: data.phone_number_id || '',
          access_token: data.access_token || '',
          webhook_verify_token: data.webhook_verify_token || '',
          business_account_id: data.business_account_id || '',
          enabled: data.enabled || false
        });
      }
    } catch (error) {
      console.error('Error fetching WhatsApp config:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do WhatsApp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.phone_number_id || !formData.access_token || !formData.webhook_verify_token || !formData.business_account_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { data: restaurant } = await supabase
        .from('restaurant_config')
        .select('id')
        .single();

      if (!restaurant) throw new Error('Restaurant not found');

      const configData: WhatsAppConfig = {
        ...formData,
        restaurant_id: restaurant.id
      };

      const { error } = await supabase
        .from('whatsapp_config')
        .upsert(configData);

      if (error) throw error;

      setConfig({ ...configData, id: config?.id });
      
      toast({
        title: "Sucesso",
        description: "Configurações do WhatsApp salvas com sucesso",
      });
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações do WhatsApp",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testPhone) {
      toast({
        title: "Erro",
        description: "Digite um número de telefone para teste",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/whatsapp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: testPhone,
          config: formData
        }),
      });

      const result = await response.json();
      
      setTestResult({
        success: response.ok,
        message: result.message || (response.ok ? 'Mensagem de teste enviada com sucesso!' : 'Erro ao enviar mensagem de teste')
      });

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Mensagem de teste enviada com sucesso!",
        });
      } else {
        toast({
          title: "Erro",
          description: "Erro ao enviar mensagem de teste",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error testing WhatsApp:', error);
      setTestResult({
        success: false,
        message: 'Erro de conexão ao testar WhatsApp'
      });
      toast({
        title: "Erro",
        description: "Erro de conexão ao testar WhatsApp",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const generateWebhookUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/whatsapp/webhook`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado",
      description: "URL copiada para a área de transferência",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Configuração WhatsApp</h1>
          <p className="text-muted-foreground">Configure a integração com WhatsApp Business API</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-full"></div>
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="h-8 w-8 text-green-600" />
          Configuração WhatsApp
        </h1>
        <p className="text-muted-foreground">
          Configure a integração com WhatsApp Business API para notificações automáticas
        </p>
        <div className="flex items-center gap-2">
          <Badge variant={config?.enabled ? "default" : "secondary"}>
            {config?.enabled ? (
              <>
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativo
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3 mr-1" />
                Inativo
              </>
            )}
          </Badge>
        </div>
      </div>

      {/* Configurações Principais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configurações da API
          </CardTitle>
          <CardDescription>
            Configure os dados da sua conta WhatsApp Business
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone_number_id" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Phone Number ID *
              </Label>
              <Input
                id="phone_number_id"
                value={formData.phone_number_id}
                onChange={(e) => setFormData(prev => ({ ...prev, phone_number_id: e.target.value }))}
                placeholder="Ex: 123456789012345"
              />
              <p className="text-xs text-muted-foreground">
                ID do número de telefone no WhatsApp Business API
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="business_account_id" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Business Account ID *
              </Label>
              <Input
                id="business_account_id"
                value={formData.business_account_id}
                onChange={(e) => setFormData(prev => ({ ...prev, business_account_id: e.target.value }))}
                placeholder="Ex: 123456789012345"
              />
              <p className="text-xs text-muted-foreground">
                ID da conta business no Facebook
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Access Token *
            </Label>
            <div className="relative">
              <Input
                id="access_token"
                type={showTokens ? "text" : "password"}
                value={formData.access_token}
                onChange={(e) => setFormData(prev => ({ ...prev, access_token: e.target.value }))}
                placeholder="Token de acesso da API"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowTokens(!showTokens)}
              >
                {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Token de acesso permanente da API do WhatsApp
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook_verify_token" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Webhook Verify Token *
            </Label>
            <div className="relative">
              <Input
                id="webhook_verify_token"
                type={showTokens ? "text" : "password"}
                value={formData.webhook_verify_token}
                onChange={(e) => setFormData(prev => ({ ...prev, webhook_verify_token: e.target.value }))}
                placeholder="Token para verificação do webhook"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowTokens(!showTokens)}
              >
                {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Token personalizado para verificação do webhook
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="enabled" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Ativar Integração
              </Label>
              <p className="text-sm text-muted-foreground">
                Habilita o envio automático de notificações via WhatsApp
              </p>
            </div>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Webhook Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Configuração do Webhook
          </CardTitle>
          <CardDescription>
            Configure o webhook no Facebook Developer Console
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>URL do Webhook</Label>
            <div className="flex gap-2">
              <Input
                value={generateWebhookUrl()}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(generateWebhookUrl())}
              >
                Copiar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use esta URL no Facebook Developer Console
            </p>
          </div>

          <div className="space-y-2">
            <Label>Token de Verificação</Label>
            <div className="flex gap-2">
              <Input
                value={formData.webhook_verify_token || 'Seu token aqui'}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                onClick={() => copyToClipboard(formData.webhook_verify_token || '')}
              >
                Copiar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use este token para verificar o webhook
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900">
                  Como configurar o webhook:
                </p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Acesse o Facebook Developer Console</li>
                  <li>Vá para sua aplicação WhatsApp Business</li>
                  <li>Configure o webhook com a URL e token acima</li>
                  <li>Subscreva aos eventos: messages, message_deliveries</li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teste da Integração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Teste da Integração
          </CardTitle>
          <CardDescription>
            Teste se a configuração está funcionando corretamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="testPhone">Número de Telefone para Teste</Label>
            <Input
              id="testPhone"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              placeholder="Ex: 5511999999999"
            />
            <p className="text-xs text-muted-foreground">
              Digite o número no formato internacional (ex: 5511999999999)
            </p>
          </div>

          <Button 
            onClick={handleTest} 
            disabled={testing || !testPhone || !formData.enabled}
            className="w-full"
          >
            {testing ? (
              <>
                <TestTube className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Enviar Mensagem de Teste
              </>
            )}
          </Button>

          {testResult && (
            <div className={`p-4 rounded-lg flex items-center gap-2 ${
              testResult.success 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}>
              {testResult.success ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              <span className="text-sm font-medium">{testResult.message}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status da Integração */}
      <Card>
        <CardHeader>
          <CardTitle>Status da Integração</CardTitle>
          <CardDescription>
            Informações sobre o status atual da integração
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                {config?.enabled ? (
                  <CheckCircle className="h-6 w-6 text-green-600" />
                ) : (
                  <XCircle className="h-6 w-6 text-gray-400" />
                )}
              </div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-muted-foreground">
                {config?.enabled ? 'Ativo' : 'Inativo'}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-sm font-medium">Phone Number ID</p>
              <p className="text-xs text-muted-foreground font-mono">
                {formData.phone_number_id || 'Não configurado'}
              </p>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-sm font-medium">Business Account</p>
              <p className="text-xs text-muted-foreground font-mono">
                {formData.business_account_id || 'Não configurado'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
