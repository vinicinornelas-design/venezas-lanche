import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function DebugNotificacoes() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Verificando...');
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { enableSound, disableSound, isSoundEnabled } = useRealtimeNotifications(true);
  const { createNotification } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    checkConnection();
    loadNotifications();
  }, []);

  const checkConnection = async () => {
    try {
      // Testar conexão com Supabase
      const { data, error } = await supabase
        .from('pedidos_unificados')
        .select('count')
        .limit(1);

      if (error) {
        setConnectionStatus(`❌ Erro: ${error.message}`);
      } else {
        setConnectionStatus('✅ Conectado ao Supabase');
      }
    } catch (error) {
      setConnectionStatus(`❌ Erro de conexão: ${error}`);
    }
  };

  const loadNotifications = () => {
    try {
      const stored = localStorage.getItem('pedidos_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  const testNotification = async () => {
    try {
      // Criar notificação de teste
      const testNotification = {
        type: 'NEW_ORDER',
        title: 'Teste Manual',
        message: 'Notificação de teste criada manualmente',
        data: {
          pedido_id: 'test_' + Date.now(),
          numero_pedido: 9999,
          cliente_nome: 'Cliente Teste',
          origem: 'DELIVERY',
          total: '25.00'
        },
        read: false
      };

      await createNotification(testNotification);
      
      // Salvar no localStorage
      const existing = JSON.parse(localStorage.getItem('pedidos_notifications') || '[]');
      existing.unshift({
        ...testNotification,
        id: 'test_' + Date.now(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      localStorage.setItem('pedidos_notifications', JSON.stringify(existing));
      
      loadNotifications();
      
      toast({
        title: "🧪 Teste de Notificação",
        description: "Notificação de teste criada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao criar notificação de teste:', error);
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
            nome: 'Teste Debug',
            categoria: 'TRADICIONAIS',
            adicionais: [],
            quantidade: 1,
            preco_unitario: 20
          }],
          origem: 'DELIVERY',
          metodo_pagamento: 'pix',
          cliente_nome: 'Cliente Debug Teste',
          cliente_telefone: '(11) 77777-7777',
          cliente_endereco: 'Rua Debug, 123',
          cliente_bairro: 'Centro',
          taxa_entrega: '5.00',
          desconto: '0.00',
          subtotal: '20.00',
          total: '25.00',
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
        setLastOrder(data);
        toast({
          title: "✅ Sucesso",
          description: `Pedido #${data.numero_pedido} inserido com sucesso!`,
        });
      }
    } catch (error) {
      console.error('Erro ao inserir pedido:', error);
    }
  };

  const clearNotifications = () => {
    localStorage.removeItem('pedidos_notifications');
    setNotifications([]);
    toast({
      title: "🗑️ Limpeza",
      description: "Notificações limpas com sucesso!",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔧 Debug de Notificações</h1>
        <p className="text-gray-600">Teste e debug do sistema de notificações</p>
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
              <Button onClick={checkConnection} variant="outline" size="sm">
                🔄 Verificar Conexão
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Controles de Som */}
        <Card>
          <CardHeader>
            <CardTitle>🔊 Controles de Som</CardTitle>
            <CardDescription>Gerenciar som das notificações</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Badge variant={isSoundEnabled() ? 'default' : 'secondary'}>
                Som: {isSoundEnabled() ? '✅ Habilitado' : '❌ Desabilitado'}
              </Badge>
              <div className="flex gap-2">
                <Button onClick={enableSound} size="sm">
                  🔊 Habilitar Som
                </Button>
                <Button onClick={disableSound} variant="outline" size="sm">
                  🔇 Desabilitar Som
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teste de Notificação */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Teste Manual</CardTitle>
            <CardDescription>Criar notificação de teste</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button onClick={testNotification} className="w-full">
                📱 Criar Notificação de Teste
              </Button>
              <Button onClick={insertTestOrder} variant="outline" className="w-full">
                📦 Inserir Pedido de Teste
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Último Pedido */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Último Pedido</CardTitle>
            <CardDescription>Informações do último pedido inserido</CardDescription>
          </CardHeader>
          <CardContent>
            {lastOrder ? (
              <div className="space-y-2">
                <p><strong>Número:</strong> #{lastOrder.numero_pedido}</p>
                <p><strong>Cliente:</strong> {lastOrder.cliente_nome}</p>
                <p><strong>Total:</strong> R$ {lastOrder.total}</p>
                <p><strong>Status:</strong> {lastOrder.status}</p>
              </div>
            ) : (
              <p className="text-gray-500">Nenhum pedido inserido ainda</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lista de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Notificações Armazenadas</CardTitle>
          <CardDescription>
            Notificações salvas no localStorage ({notifications.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={loadNotifications} variant="outline" size="sm">
                🔄 Recarregar
              </Button>
              <Button onClick={clearNotifications} variant="destructive" size="sm">
                🗑️ Limpar Todas
              </Button>
            </div>
            
            {notifications.length > 0 ? (
              <div className="space-y-2">
                {notifications.slice(0, 5).map((notif, index) => (
                  <div key={notif.id || index} className="p-3 border rounded">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{notif.title}</p>
                        <p className="text-sm text-gray-600">{notif.message}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(notif.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant={notif.read ? 'secondary' : 'default'}>
                        {notif.read ? 'Lida' : 'Não lida'}
                      </Badge>
                    </div>
                  </div>
                ))}
                {notifications.length > 5 && (
                  <p className="text-sm text-gray-500">
                    ... e mais {notifications.length - 5} notificações
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Nenhuma notificação armazenada</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
