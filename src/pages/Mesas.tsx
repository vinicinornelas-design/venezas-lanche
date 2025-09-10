import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Coffee,
  Edit3,
  User,
  Calendar
} from "lucide-react";

interface Mesa {
  id: string;
  numero: number;
  status: string;
  etiqueta: string;
  observacoes: string;
  responsavel_funcionario_id: string;
  opened_at: string;
  closed_at: string;
  created_at: string;
  funcionarios?: {
    nome: string;
  };
}

interface Funcionario {
  id: string;
  nome: string;
  ativo: boolean;
}

export default function Mesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [observacoes, setObservacoes] = useState("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchMesas();
    fetchFuncionarios();
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchMesas = async () => {
    try {
      const { data, error } = await supabase
        .from('mesas')
        .select(`
          *,
          funcionarios (nome)
        `)
        .order('numero');

      if (error) throw error;
      setMesas(data || []);
    } catch (error) {
      console.error('Error fetching mesas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mesas",
        variant: "destructive",
      });
    }
  };

  const fetchFuncionarios = async () => {
    try {
      const { data, error } = await supabase
        .from('funcionarios')
        .select('id, nome, ativo')
        .eq('ativo', true);

      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      console.error('Error fetching funcionarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMesas = async () => {
    try {
      const mesasData = [];
      for (let i = 1; i <= 20; i++) {
        mesasData.push({
          numero: i,
          status: 'LIVRE',
          etiqueta: `Mesa ${i} - Restaurante`,
          observacoes: ''
        });
      }

      const { error } = await supabase
        .from('mesas')
        .upsert(mesasData, { 
          onConflict: 'numero',
          ignoreDuplicates: true 
        });

      if (error) throw error;
      fetchMesas();
    } catch (error) {
      console.error('Error initializing mesas:', error);
    }
  };

  const updateMesaStatus = async (mesaId: string, newStatus: string, funcionarioId?: string) => {
    try {
      const updateData: any = { 
        status: newStatus,
        responsavel_funcionario_id: funcionarioId || null
      };

      if (newStatus === 'OCUPADA') {
        updateData.opened_at = new Date().toISOString();
        updateData.closed_at = null;
      } else if (newStatus === 'LIVRE') {
        updateData.closed_at = new Date().toISOString();
        updateData.responsavel_funcionario_id = null;
      }

      const { error } = await supabase
        .from('mesas')
        .update(updateData)
        .eq('id', mesaId);

      if (error) throw error;

      await fetchMesas();
      toast({
        title: "Sucesso",
        description: `Mesa ${newStatus.toLowerCase()}`,
      });
    } catch (error) {
      console.error('Error updating mesa status:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da mesa",
        variant: "destructive",
      });
    }
  };

  const updateObservacoes = async () => {
    if (!selectedMesa) return;

    try {
      const { error } = await supabase
        .from('mesas')
        .update({ observacoes })
        .eq('id', selectedMesa.id);

      if (error) throw error;

      await fetchMesas();
      setObservacoes("");
      setSelectedMesa(null);
      
      toast({
        title: "Sucesso",
        description: "Observações atualizadas",
      });
    } catch (error) {
      console.error('Error updating observacoes:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar observações",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVRE':
        return 'status-available';
      case 'OCUPADA':
        return 'status-occupied';
      case 'RESERVADA':
        return 'status-reserved';
      case 'LIMPEZA':
        return 'status-cleaning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'LIVRE':
        return <CheckCircle className="h-4 w-4" />;
      case 'OCUPADA':
        return <Users className="h-4 w-4" />;
      case 'RESERVADA':
        return <Calendar className="h-4 w-4" />;
      case 'LIMPEZA':
        return <Coffee className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Controle de Mesas</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(20)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (mesas.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Controle de Mesas
          </h1>
          <p className="text-muted-foreground">
            Sistema de controle de mesas em tempo real
          </p>
        </div>
        
        <Card className="text-center p-8">
          <div className="space-y-4">
            <Users className="h-16 w-16 text-muted-foreground mx-auto" />
            <h3 className="text-lg font-semibold">Nenhuma mesa encontrada</h3>
            <p className="text-muted-foreground">
              Clique no botão abaixo para inicializar as mesas (1-20)
            </p>
            <Button onClick={initializeMesas} className="gradient-primary">
              Inicializar Mesas
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Controle de Mesas
        </h1>
        <p className="text-muted-foreground">
          Sistema de controle de mesas em tempo real - {userProfile?.nome}
        </p>
      </div>

      {/* Mesas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {mesas.map((mesa) => (
          <Card 
            key={mesa.id} 
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-2 ${
              mesa.status === 'OCUPADA' ? 'border-primary/50 shadow-warm' : 
              mesa.status === 'LIVRE' ? 'border-success/50' : 
              mesa.status === 'RESERVADA' ? 'border-purple-500/50' :
              'border-blue-500/50'
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">
                  Mesa {mesa.numero}
                </CardTitle>
                <Badge className={getStatusColor(mesa.status)}>
                  {getStatusIcon(mesa.status)}
                  {mesa.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {mesa.etiqueta && (
                <p className="text-sm text-muted-foreground">{mesa.etiqueta}</p>
              )}
              
              {mesa.funcionarios?.nome && (
                <div className="flex items-center gap-1 text-sm">
                  <User className="h-3 w-3" />
                  <span>{mesa.funcionarios.nome}</span>
                </div>
              )}
              
              {mesa.opened_at && mesa.status === 'OCUPADA' && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {new Date(mesa.opened_at).toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}

              {mesa.observacoes && (
                <div className="text-xs bg-muted/50 p-2 rounded">
                  {mesa.observacoes}
                </div>
              )}

              <div className="flex gap-1">
                {mesa.status === 'LIVRE' && (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="flex-1 gradient-primary">
                          Ocupar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ocupar Mesa {mesa.numero}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Funcionário Responsável</Label>
                            <Select onValueChange={(value) => updateMesaStatus(mesa.id, 'OCUPADA', value)}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o funcionário" />
                              </SelectTrigger>
                              <SelectContent>
                                {funcionarios.map((func) => (
                                  <SelectItem key={func.id} value={func.id}>
                                    {func.nome}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateMesaStatus(mesa.id, 'RESERVADA')}
                    >
                      Reservar
                    </Button>
                  </>
                )}
                
                {mesa.status === 'OCUPADA' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => updateMesaStatus(mesa.id, 'LIVRE')}
                      className="flex-1 bg-success hover:bg-success/90"
                    >
                      Liberar
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateMesaStatus(mesa.id, 'LIMPEZA')}
                    >
                      Limpeza
                    </Button>
                  </>
                )}
                
                {(mesa.status === 'RESERVADA' || mesa.status === 'LIMPEZA') && (
                  <Button 
                    size="sm" 
                    onClick={() => updateMesaStatus(mesa.id, 'LIVRE')}
                    className="flex-1 bg-success hover:bg-success/90"
                  >
                    Liberar
                  </Button>
                )}

                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => {
                        setSelectedMesa(mesa);
                        setObservacoes(mesa.observacoes || "");
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Observações - Mesa {mesa.numero}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Observações sobre a mesa</Label>
                        <Textarea
                          value={observacoes}
                          onChange={(e) => setObservacoes(e.target.value)}
                          placeholder="Digite observações sobre a mesa..."
                          rows={3}
                        />
                      </div>
                      <Button onClick={updateObservacoes} className="w-full gradient-primary">
                        Salvar Observações
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-success/10 border-success/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">
              {mesas.filter(m => m.status === 'LIVRE').length}
            </div>
            <p className="text-sm text-success">Mesas Livres</p>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {mesas.filter(m => m.status === 'OCUPADA').length}
            </div>
            <p className="text-sm text-primary">Mesas Ocupadas</p>
          </CardContent>
        </Card>
        
        <Card className="bg-purple-500/10 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {mesas.filter(m => m.status === 'RESERVADA').length}
            </div>
            <p className="text-sm text-purple-600">Mesas Reservadas</p>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-500/10 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {mesas.filter(m => m.status === 'LIMPEZA').length}
            </div>
            <p className="text-sm text-blue-600">Em Limpeza</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}