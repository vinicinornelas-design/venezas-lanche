import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function TesteRealtime() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Verificando...');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('Não conectado');
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    testRealtimeConnection();
  }, []);

  const testRealtimeConnection = async () => {
    try {
      console.log('🔔 Testando conexão Realtime...');
      
      // Testar conexão básica
      const { data, error } = await supabase
        .from('pedidos_unificados')
        .select('count')
        .limit(1);

      if (error) {
        setConnectionStatus(`❌ Erro: ${error.message}`);
        return;
      }

      setConnectionStatus('✅ Conectado ao Supabase');

      // Testar subscription
      const channel = supabase
        .channel('test_realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'pedidos_unificados'
          },
          (payload) => {
            console.log('🔔 MENSAGEM RECEBIDA:', payload);
            setLastMessage(payload);
            setMessages(prev => [payload, ...prev.slice(0, 9)]); // Manter últimos 10
            
            toast({
              title: "🔔 Notificação Recebida!",
              description: `Pedido #${payload.new.numero_pedido} detectado`,
              duration: 5000,
            });
          }
        )
        .subscribe((status) => {
          console.log('🔔 Status da subscription:', status);
          setSubscriptionStatus(status);
          
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

      // Cleanup
      return () => {
        supabase.removeChannel(channel);
      };

    } catch (error) {
      console.error('Erro ao testar Realtime:', error);
      setConnectionStatus(`❌ Erro: ${error}`);
    }
  };

  const insertTestOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('pedidos_unificados')
        .insert([{
          id: crypto.randomUUID(),
          numero_pedido: Math.floor(Math.random() * 9000) + 1000,
          itens: [{
            nome: 'Teste Realtime Manual',
            categoria: 'TRADICIONAIS',
            adicionais: [],
            quantidade: 1,
            preco_unitario: 25
          }],
          origem: 'DELIVERY',
          metodo_pagamento: 'pix',
          cliente_nome: 'Cliente Teste Realtime',
          cliente_telefone: '(11) 99999-9999',
          cliente_endereco: 'Rua Teste, 123',
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
          title: "❌ Erro",
          description: `Erro ao inserir pedido: ${error.message}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Pedido Inserido",
          description: `Pedido #${data.numero_pedido} inserido com sucesso!`,
        });
      }
    } catch (error) {
      console.error('Erro ao inserir pedido:', error);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setLastMessage(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔔 Teste de Realtime</h1>
        <p className="text-gray-600">Teste direto da conexão Supabase Realtime</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Status da Conexão */}
        <Card>
          <CardHeader>
            <CardTitle>🔗 Status da Conexão</CardTitle>
            <CardDescription>Verificação da conexão com Supabase</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge variant={connectionStatus.includes('✅') ? 'default' : 'destructive'}>
                {connectionStatus}
              </Badge>
              <Badge variant={subscriptionStatus === 'SUBSCRIBED' ? 'default' : 'secondary'}>
                Subscription: {subscriptionStatus}
              </Badge>
              <Button onClick={testRealtimeConnection} variant="outline" size="sm">
                🔄 Testar Conexão
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Teste de Inserção */}
        <Card>
          <CardHeader>
            <CardTitle>📦 Teste de Inserção</CardTitle>
            <CardDescription>Inserir pedido para testar notificação</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={insertTestOrder} className="w-full">
              📦 Inserir Pedido de Teste
            </Button>
          </CardContent>
        </Card>

        {/* Última Mensagem */}
        <Card>
          <CardHeader>
            <CardTitle>📨 Última Mensagem</CardTitle>
            <CardDescription>Última notificação recebida</CardDescription>
          </CardHeader>
          <CardContent>
            {lastMessage ? (
              <div className="space-y-2">
                <p><strong>Evento:</strong> {lastMessage.eventType}</p>
                <p><strong>Tabela:</strong> {lastMessage.table}</p>
                <p><strong>Schema:</strong> {lastMessage.schema}</p>
                <p><strong>Pedido:</strong> #{lastMessage.new?.numero_pedido}</p>
                <p><strong>Cliente:</strong> {lastMessage.new?.cliente_nome}</p>
                <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma mensagem recebida ainda</p>
            )}
          </CardContent>
        </Card>

        {/* Controles */}
        <Card>
          <CardHeader>
            <CardTitle>🎛️ Controles</CardTitle>
            <CardDescription>Gerenciar teste</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={clearMessages} variant="outline" className="w-full">
              🗑️ Limpar Mensagens
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Mensagens */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Histórico de Mensagens</CardTitle>
          <CardDescription>
            Últimas mensagens recebidas ({messages.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length > 0 ? (
            <div className="space-y-2">
              {messages.map((msg, index) => (
                <div key={index} className="p-3 border rounded">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">
                        {msg.eventType} - {msg.table}
                      </p>
                      <p className="text-sm text-gray-600">
                        Pedido #{msg.new?.numero_pedido} - {msg.new?.cliente_nome}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="default">
                      #{msg.new?.numero_pedido}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nenhuma mensagem recebida ainda</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
