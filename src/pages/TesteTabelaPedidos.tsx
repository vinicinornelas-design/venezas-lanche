import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function TesteTabelaPedidos() {
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [tableStructure, setTableStructure] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkTable();
  }, []);

  const checkTable = async () => {
    setLoading(true);
    try {
      // Verificar se a tabela existe
      const { data, error } = await supabase
        .from('pedidos_unificados')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Erro ao verificar tabela:', error);
        setTableExists(false);
        toast({
          title: "❌ Tabela não encontrada",
          description: `Erro: ${error.message}`,
          variant: "destructive",
        });
      } else {
        setTableExists(true);
        toast({
          title: "✅ Tabela encontrada",
          description: "Tabela pedidos_unificados existe e é acessível",
        });
      }

      // Buscar pedidos recentes
      const { data: orders, error: ordersError } = await supabase
        .from('pedidos_unificados')
        .select('numero_pedido, cliente_nome, origem, total, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) {
        console.error('Erro ao buscar pedidos:', ordersError);
      } else {
        setRecentOrders(orders || []);
      }

    } catch (error) {
      console.error('Erro geral:', error);
      setTableExists(false);
    } finally {
      setLoading(false);
    }
  };

  const insertTestOrder = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pedidos_unificados')
        .insert([{
          id: crypto.randomUUID(),
          numero_pedido: Math.floor(Math.random() * 9000) + 1000,
          itens: [{
            nome: 'Teste Tabela Pedidos',
            categoria: 'TRADICIONAIS',
            adicionais: [],
            quantidade: 1,
            preco_unitario: 25
          }],
          origem: 'DELIVERY',
          metodo_pagamento: 'pix',
          cliente_nome: 'Cliente Teste Tabela',
          cliente_telefone: '(11) 44444-4444',
          cliente_endereco: 'Rua Teste Tabela, 123',
          cliente_bairro: 'Centro',
          taxa_entrega: '5.00',
          desconto: '0.00',
          subtotal: '25.00',
          total: '30.00',
          status: 'PENDENTE',
          pago: false
        }])
        .select()
        .single();

      if (error) {
        toast({
          title: "❌ Erro ao inserir",
          description: `Erro: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Pedido inserido",
          description: `Pedido #${data.numero_pedido} inserido com sucesso!`,
        });
        
        // Recarregar lista
        checkTable();
      }
    } catch (error) {
      console.error('Erro ao inserir pedido:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao inserir pedido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testRealtimeSubscription = async () => {
    try {
      console.log('🔔 Testando subscription Realtime...');
      
      const channel = supabase
        .channel('test_pedidos_unificados')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'pedidos_unificados'
          },
          (payload) => {
            console.log('🔔 NOTIFICAÇÃO RECEBIDA:', payload);
            toast({
              title: "🔔 Notificação Recebida!",
              description: `Pedido #${payload.new.numero_pedido} detectado via Realtime`,
              duration: 5000,
            });
          }
        )
        .subscribe((status) => {
          console.log('🔔 Status da subscription:', status);
          
          if (status === 'SUBSCRIBED') {
            toast({
              title: "✅ Subscription Ativa",
              description: "Aguardando novos pedidos...",
            });
          } else if (status === 'CHANNEL_ERROR') {
            toast({
              title: "❌ Erro no Canal",
              description: "Problema na conexão Realtime",
              variant: "destructive",
            });
          }
        });

      // Manter subscription ativa por 30 segundos
      setTimeout(() => {
        supabase.removeChannel(channel);
        toast({
          title: "⏰ Subscription Finalizada",
          description: "Teste de 30 segundos concluído",
        });
      }, 30000);

    } catch (error) {
      console.error('Erro ao testar subscription:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔍 Teste da Tabela Pedidos</h1>
        <p className="text-gray-600">Verificação da tabela pedidos_unificados e Realtime</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status da Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Status da Tabela</CardTitle>
            <CardDescription>Verificação da existência e acesso</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge variant={tableExists === true ? 'default' : tableExists === false ? 'destructive' : 'secondary'}>
                {tableExists === true ? '✅ Tabela Existe' : tableExists === false ? '❌ Tabela Não Existe' : '⏳ Verificando...'}
              </Badge>
              <Button onClick={checkTable} variant="outline" size="sm" disabled={loading}>
                {loading ? '🔄 Verificando...' : '🔄 Verificar Tabela'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teste de Inserção */}
        <Card>
          <CardHeader>
            <CardTitle>📦 Teste de Inserção</CardTitle>
            <CardDescription>Inserir pedido para testar</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={insertTestOrder} className="w-full" disabled={loading}>
              {loading ? '🔄 Inserindo...' : '📦 Inserir Pedido de Teste'}
            </Button>
          </CardContent>
        </Card>

        {/* Teste Realtime */}
        <Card>
          <CardHeader>
            <CardTitle>🔔 Teste Realtime</CardTitle>
            <CardDescription>Testar subscription em tempo real</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testRealtimeSubscription} variant="outline" className="w-full">
              🔔 Testar Subscription (30s)
            </Button>
          </CardContent>
        </Card>

        {/* Controles */}
        <Card>
          <CardHeader>
            <CardTitle>🎛️ Controles</CardTitle>
            <CardDescription>Gerenciar teste</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={checkTable} variant="outline" className="w-full" disabled={loading}>
              🔄 Recarregar Dados
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Pedidos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Pedidos Recentes</CardTitle>
          <CardDescription>
            Últimos pedidos na tabela ({recentOrders.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.map((order, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        Pedido #{order.numero_pedido}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.cliente_nome} - {order.origem}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total: R$ {order.total} - Status: {order.status}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="default">
                      #{order.numero_pedido}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhum pedido encontrado</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
