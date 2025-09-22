import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import MinimalFileUpload from "@/components/MinimalFileUpload";
import { 
  Building2, 
  Clock, 
  Phone, 
  MapPin,
  Save,
  Upload,
  Image as ImageIcon,
  Plus,
  Edit,
  Trash2,
  MapPin as MapPinIcon
} from "lucide-react";

interface BairroEntrega {
  id: string;
  nome: string;
  valor_entrega: number;
  ativo: boolean;
}

interface RestaurantConfig {
  id: string;
  nome_restaurante: string;
  endereco: string;
  telefone: string;
  horario_funcionamento: any;
  logo_url?: string;
  banner_url?: string;
  bairros_entrega?: BairroEntrega[];
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
  const [showBairroForm, setShowBairroForm] = useState(false);
  const [editingBairro, setEditingBairro] = useState<BairroEntrega | null>(null);
  const [bairroForm, setBairroForm] = useState({
    nome: '',
    valor_entrega: 0,
    ativo: true
  });
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
          banner_url: config.banner_url,
          bairros_entrega: config.bairros_entrega || []
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

  // Funções para gerenciar bairros
  const resetBairroForm = () => {
    setBairroForm({
      nome: '',
      valor_entrega: 0,
      ativo: true
    });
    setEditingBairro(null);
    setShowBairroForm(false);
  };

  const handleAddBairro = () => {
    resetBairroForm();
    setShowBairroForm(true);
  };

  const handleEditBairro = (bairro: BairroEntrega) => {
    setBairroForm({
      nome: bairro.nome,
      valor_entrega: bairro.valor_entrega,
      ativo: bairro.ativo
    });
    setEditingBairro(bairro);
    setShowBairroForm(true);
  };

  const handleSaveBairro = () => {
    if (!config || !bairroForm.nome.trim()) {
      toast({
        title: "Erro",
        description: "Nome do bairro é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (bairroForm.valor_entrega < 0) {
      toast({
        title: "Erro",
        description: "Valor da entrega deve ser maior ou igual a zero",
        variant: "destructive",
      });
      return;
    }

    const bairros = config.bairros_entrega || [];
    let novosBairros = [...bairros];

    if (editingBairro) {
      // Editar bairro existente
      novosBairros = novosBairros.map(b => 
        b.id === editingBairro.id 
          ? { ...bairroForm, id: editingBairro.id }
          : b
      );
    } else {
      // Adicionar novo bairro
      const novoBairro: BairroEntrega = {
        id: Date.now().toString(),
        ...bairroForm
      };
      novosBairros.push(novoBairro);
    }

    setConfig({
      ...config,
      bairros_entrega: novosBairros
    });

    resetBairroForm();
    toast({
      title: "Sucesso",
      description: editingBairro ? "Bairro atualizado" : "Bairro adicionado",
    });
  };

  const handleDeleteBairro = (bairroId: string) => {
    if (!config) return;
    
    const bairros = config.bairros_entrega || [];
    const novosBairros = bairros.filter(b => b.id !== bairroId);
    
    setConfig({
      ...config,
      bairros_entrega: novosBairros
    });

    toast({
      title: "Sucesso",
      description: "Bairro removido",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
            <CardDescription>
              Faça upload das imagens do seu restaurante
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MinimalFileUpload
                label="Logo do Restaurante"
                value={config.logo_url}
                onChange={(url) => updateConfig('logo_url', url)}
                maxSize={5}
              />
              <MinimalFileUpload
                label="Banner/Capa do Restaurante"
                value={config.banner_url}
                onChange={(url) => updateConfig('banner_url', url)}
                maxSize={10}
              />
            </div>
          </CardContent>
        </Card>

        {/* Bairros de Entrega */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-blue-600" />
              Bairros de Entrega
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Configure os bairros onde você entrega e os valores cobrados
              </p>
              <Button onClick={handleAddBairro} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Bairro
              </Button>
            </div>

            {/* Formulário de Bairro */}
            {showBairroForm && (
              <div className="p-4 border rounded-lg bg-blue-50">
                <h3 className="font-semibold text-blue-800 mb-4">
                  {editingBairro ? 'Editar Bairro' : 'Novo Bairro'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Nome do Bairro</Label>
                    <Input
                      value={bairroForm.nome}
                      onChange={(e) => setBairroForm({...bairroForm, nome: e.target.value})}
                      placeholder="Ex: Centro, Savassi, Pampulha"
                    />
                  </div>
                  <div>
                    <Label>Valor da Entrega (R$)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={bairroForm.valor_entrega}
                      onChange={(e) => setBairroForm({...bairroForm, valor_entrega: parseFloat(e.target.value) || 0})}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bairro-ativo"
                      checked={bairroForm.ativo}
                      onChange={(e) => setBairroForm({...bairroForm, ativo: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="bairro-ativo">Bairro ativo</Label>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleSaveBairro} className="bg-blue-600 hover:bg-blue-700">
                    <Save className="h-4 w-4 mr-2" />
                    {editingBairro ? 'Atualizar' : 'Adicionar'}
                  </Button>
                  <Button onClick={resetBairroForm} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </div>
            )}

            {/* Lista de Bairros */}
            <div className="space-y-2">
              {config.bairros_entrega && config.bairros_entrega.length > 0 ? (
                <div className="grid gap-2">
                  {config.bairros_entrega.map((bairro) => (
                    <div key={bairro.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${bairro.ativo ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        <div>
                          <span className="font-medium">{bairro.nome}</span>
                          <div className="text-sm text-gray-600">
                            {formatCurrency(bairro.valor_entrega)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleEditBairro(bairro)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDeleteBairro(bairro.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MapPinIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum bairro configurado</p>
                  <p className="text-sm">Adicione bairros para configurar valores de entrega</p>
                </div>
              )}
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