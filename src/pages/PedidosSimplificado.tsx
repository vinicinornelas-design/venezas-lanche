import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export default function PedidosSimplificado() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPedidos();
  }, []);

  const fetchPedidos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Iniciando busca de pedidos...');
      
      const { data, error } = await supabase
        .from('pedidos_unificados')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('Dados recebidos:', data);
      console.log('Erro recebido:', error);

      if (error) {
        throw error;
      }

      setPedidos(data || []);
    } catch (err) {
      console.error('Erro ao buscar pedidos:', err);
      setError('Erro ao carregar pedidos: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p>Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-600">
          <p>Erro: {error}</p>
          <Button onClick={fetchPedidos} className="mt-2">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Simplificado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Total de pedidos: {pedidos.length}</p>
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="p-4 border rounded-lg">
                <p><strong>ID:</strong> {pedido.id}</p>
                <p><strong>Número:</strong> {pedido.numero_pedido}</p>
                <p><strong>Cliente:</strong> {pedido.cliente_nome || 'N/A'}</p>
                <p><strong>Status:</strong> {pedido.status}</p>
                <p><strong>Total:</strong> R$ {pedido.total?.toFixed(2) || '0,00'}</p>
                <p><strong>Criado em:</strong> {new Date(pedido.created_at).toLocaleString('pt-BR')}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
