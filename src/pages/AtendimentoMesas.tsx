import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  Search, 
  Filter, 
  Plus, 
  Clock, 
  Users, 
  ShoppingCart,
  Eye,
  UserCheck,
  RefreshCw
} from "lucide-react";
import MesaCard from "@/components/atendimento/MesaCard";
import CriarPedidoModal from "@/components/atendimento/CriarPedidoModal";
import PedidosMesa from "@/components/atendimento/PedidosMesa";

interface Mesa {
  id: string;
  numero: number;
  status: string;
  etiqueta: string | null;
  observacoes: string | null;
  opened_at: string | null;
  closed_at: string | null;
  responsavel_funcionario_id: string | null;
  funcionario_nome?: string;
  tempo_ocupacao?: number;
}

interface Funcionario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  ativo: boolean;
}

export default function AtendimentoMesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null);
  const [showCriarPedido, setShowCriarPedido] = useState(false);
  const [showPedidosMesa, setShowPedidosMesa] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchMesas();
    fetchFuncionarios();
    setupRealtimeSubscription();
    
    // Cleanup subscription on unmount
    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  const fetchMesas = async () => {
    try {
      const { data, error } = await supabase
        .from('mesas')
        .select(`
          *,
          funcionarios!mesas_responsavel_funcionario_id_fkey(nome)
        `)
        .order('numero', { ascending: true });

      if (error) throw error;

      // Calcular tempo de ocupação e adicionar nome do funcionário
      const mesasComTempo = data?.map(mesa => {
        let tempoOcupacao = 0;
        if (mesa.status === 'OCUPADA' && mesa.opened_at) {
          const agora = new Date();
          const abertura = new Date(mesa.opened_at);
          tempoOcupacao = Math.floor((agora.getTime() - abertura.getTime()) / (1000 * 60)); // em minutos
        }

        return {
          ...mesa,
          funcionario_nome: mesa.funcionarios?.nome || null,
          tempo_ocupacao: tempoOcupacao
        };
      }) || [];

      setMesas(mesasComTempo);
    } catch (error) {
      console.error('Erro ao buscar mesas:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar mesas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFuncionarios = async () => {
    try {
      const { data, error } = await supabase
        .from('funcionarios')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) throw error;
      setFuncionarios(data || []);
    } catch (error) {
      console.error('Erro ao buscar funcionários:', error);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log('Configurando subscription de mesas (atendimento)...');
    
    const channel = supabase
      .channel('atendimento-mesas-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'mesas',
        },
        (payload) => {
          console.log('Mudança detectada na tabela mesas (atendimento):', payload);
          
          // Recarregar mesas quando houver mudanças
          fetchMesas();
        }
      )
      .subscribe((status, err) => {
        console.log('Status da subscription de mesas (atendimento):', status);
        if (err) {
          console.error('Erro na subscription de mesas (atendimento):', err);
        }
        
        if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          console.log('Tentando reconectar subscription de mesas (atendimento)...');
          setTimeout(() => {
            setupRealtimeSubscription();
          }, 5000);
        }
      });

    return () => {
      console.log('Removendo subscription de mesas (atendimento)');
      supabase.removeChannel(channel);
    };
  };

  const handleAtenderMesa = (mesa: Mesa) => {
    setSelectedMesa(mesa);
    setShowCriarPedido(true);
  };

  const handleVerPedidos = (mesa: Mesa) => {
    setSelectedMesa(mesa);
    setShowPedidosMesa(true);
  };

  const handleFecharModal = () => {
    setShowCriarPedido(false);
    setShowPedidosMesa(false);
    setSelectedMesa(null);
    fetchMesas(); // Atualizar dados
  };

  const filteredMesas = mesas.filter(mesa => {
    const matchesSearch = mesa.numero.toString().includes(searchTerm) || 
                         mesa.etiqueta?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "TODOS" || mesa.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusCount = (status: string) => {
    return mesas.filter(mesa => mesa.status === status).length;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVRE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'OCUPADA':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'RESERVADA':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'LIMPEZA':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Atendimento de Mesas
          </h1>
          <p className="text-muted-foreground">Carregando mesas...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/2"></div>
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Atendimento de Mesas
          </h1>
          <p className="text-muted-foreground">
            Gerencie o atendimento das mesas do restaurante
          </p>
        </div>
        <Button onClick={fetchMesas} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Mesas Livres</CardTitle>
            <Table className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{getStatusCount('LIVRE')}</div>
            <p className="text-xs text-green-600">Disponíveis para atendimento</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">Mesas Ocupadas</CardTitle>
            <Users className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{getStatusCount('OCUPADA')}</div>
            <p className="text-xs text-orange-600">Em atendimento</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Reservadas</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800">{getStatusCount('RESERVADA')}</div>
            <p className="text-xs text-purple-600">Aguardando clientes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Limpeza</CardTitle>
            <RefreshCw className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{getStatusCount('LIMPEZA')}</div>
            <p className="text-xs text-red-600">Aguardando limpeza</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número da mesa..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Status</SelectItem>
                <SelectItem value="LIVRE">Livres</SelectItem>
                <SelectItem value="OCUPADA">Ocupadas</SelectItem>
                <SelectItem value="RESERVADA">Reservadas</SelectItem>
                <SelectItem value="LIMPEZA">Limpeza</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Mesas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredMesas.map((mesa) => (
          <MesaCard
            key={mesa.id}
            mesa={mesa}
            onAtender={() => handleAtenderMesa(mesa)}
            onVerPedidos={() => handleVerPedidos(mesa)}
            funcionarios={funcionarios}
            onUpdateMesa={fetchMesas}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredMesas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Table className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma mesa encontrada</h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || statusFilter !== "TODOS" 
                ? "Tente ajustar os filtros de busca"
                : "Não há mesas cadastradas no sistema"
              }
            </p>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showCriarPedido && selectedMesa && (
        <CriarPedidoModal
          mesa={selectedMesa}
          funcionarios={funcionarios}
          onClose={handleFecharModal}
          onSuccess={handleFecharModal}
        />
      )}

      {showPedidosMesa && selectedMesa && (
        <PedidosMesa
          mesa={selectedMesa}
          funcionarios={funcionarios}
          onClose={handleFecharModal}
          onUpdate={handleFecharModal}
        />
      )}
    </div>
  );
}
