import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  Users, 
  Clock, 
  ShoppingCart, 
  Eye, 
  UserCheck,
  RefreshCw,
  AlertCircle
} from "lucide-react";

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

interface MesaCardProps {
  mesa: Mesa;
  onAtender: () => void;
  onVerPedidos: () => void;
  funcionarios: Funcionario[];
  onUpdateMesa: () => void;
}

export default function MesaCard({ mesa, onAtender, onVerPedidos, funcionarios, onUpdateMesa }: MesaCardProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'LIVRE':
        return <Table className="h-4 w-4" />;
      case 'OCUPADA':
        return <Users className="h-4 w-4" />;
      case 'RESERVADA':
        return <Clock className="h-4 w-4" />;
      case 'LIMPEZA':
        return <RefreshCw className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const formatTempoOcupacao = (minutos: number) => {
    if (minutos < 60) {
      return `${minutos}min`;
    }
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas}h ${mins}min`;
  };

  const updateMesaStatus = async (newStatus: string, funcionarioId?: string) => {
    setLoading(true);
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
        .eq('id', mesa.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Mesa ${mesa.numero} ${newStatus.toLowerCase()}`,
      });

      onUpdateMesa();
    } catch (error) {
      console.error('Erro ao atualizar mesa:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar status da mesa",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === mesa.status) return;
    
    if (newStatus === 'OCUPADA' && mesa.status === 'LIVRE') {
      // Ao ocupar mesa, abrir modal de atendimento
      onAtender();
    } else {
      updateMesaStatus(newStatus);
    }
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-lg ${
      mesa.status === 'OCUPADA' ? 'ring-2 ring-orange-200' : 
      mesa.status === 'LIVRE' ? 'ring-2 ring-green-200' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Mesa {mesa.numero}
          </CardTitle>
          <Badge className={getStatusColor(mesa.status)}>
            <div className="flex items-center gap-1">
              {getStatusIcon(mesa.status)}
              {mesa.status}
            </div>
          </Badge>
        </div>
        {mesa.etiqueta && (
          <p className="text-sm text-muted-foreground">{mesa.etiqueta}</p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Info */}
        {mesa.status === 'OCUPADA' && (
          <div className="space-y-2">
            {mesa.funcionario_nome && (
              <div className="flex items-center gap-2 text-sm">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Atendido por:</span>
                <span className="font-medium">{mesa.funcionario_nome}</span>
              </div>
            )}
            {mesa.tempo_ocupacao !== undefined && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Tempo:</span>
                <span className="font-medium">{formatTempoOcupacao(mesa.tempo_ocupacao)}</span>
              </div>
            )}
          </div>
        )}

        {/* Observações */}
        {mesa.observacoes && (
          <div className="p-2 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Obs:</strong> {mesa.observacoes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          {mesa.status === 'LIVRE' && (
            <Button 
              onClick={onAtender}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              disabled={loading}
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Atender Mesa
            </Button>
          )}

          {mesa.status === 'OCUPADA' && (
            <div className="space-y-2">
              <Button 
                onClick={onVerPedidos}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Ver Pedidos
              </Button>
              <Button 
                onClick={() => updateMesaStatus('LIVRE')}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Liberar Mesa
              </Button>
            </div>
          )}

          {mesa.status === 'RESERVADA' && (
            <div className="space-y-2">
              <Button 
                onClick={() => updateMesaStatus('OCUPADA')}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                disabled={loading}
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Confirmar Reserva
              </Button>
              <Button 
                onClick={() => updateMesaStatus('LIVRE')}
                variant="outline"
                className="w-full"
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Cancelar Reserva
              </Button>
            </div>
          )}

          {mesa.status === 'LIMPEZA' && (
            <Button 
              onClick={() => updateMesaStatus('LIVRE')}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Mesa Limpa
            </Button>
          )}

          {/* Status Selector */}
          <div className="pt-2 border-t">
            <Select 
              value={mesa.status} 
              onValueChange={handleStatusChange}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Alterar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LIVRE">Livre</SelectItem>
                <SelectItem value="OCUPADA">Ocupada</SelectItem>
                <SelectItem value="RESERVADA">Reservada</SelectItem>
                <SelectItem value="LIMPEZA">Limpeza</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
