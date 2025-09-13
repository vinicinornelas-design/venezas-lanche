import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Settings,
  Trash2,
  CheckCheck,
  RefreshCw
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationItem } from '@/components/NotificationItem';
import { AppNotification } from '@/types/notifications';

export default function Notificacoes() {
  const {
    notifications,
    unreadCount,
    loading,
    settings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateSettings,
    refreshNotifications,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter(notification => {
    switch (activeTab) {
      case 'unread':
        return !notification.read;
      case 'orders':
        return notification.type === 'NEW_ORDER' || notification.type === 'ORDER_UPDATE';
      case 'system':
        return notification.type === 'SYSTEM';
      default:
        return true;
    }
  });

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteAll = async () => {
    const confirmDelete = window.confirm('Tem certeza que deseja deletar todas as notificações?');
    if (confirmDelete) {
      for (const notification of notifications) {
        await deleteNotification(notification.id);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
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
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Notificações
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas notificações e configurações
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshNotifications}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm font-medium">Total</p>
                <p className="text-2xl font-bold">{notifications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-sm font-medium">Não lidas</p>
                <p className="text-2xl font-bold">{unreadCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm font-medium">Pedidos</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.type === 'NEW_ORDER' || n.type === 'ORDER_UPDATE').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Sistema</p>
                <p className="text-2xl font-bold">
                  {notifications.filter(n => n.type === 'SYSTEM').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notificações */}
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                Todas
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">
                Não lidas
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="orders">
                Pedidos
                <Badge variant="secondary" className="ml-2">
                  {notifications.filter(n => n.type === 'NEW_ORDER' || n.type === 'ORDER_UPDATE').length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="system">
                Sistema
                <Badge variant="secondary" className="ml-2">
                  {notifications.filter(n => n.type === 'SYSTEM').length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4 mt-6">
              {filteredNotifications.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma notificação
                    </h3>
                    <p className="text-gray-500">
                      {activeTab === 'unread' 
                        ? 'Todas as notificações foram lidas!'
                        : 'Não há notificações nesta categoria.'
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Configurações */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações
              </CardTitle>
              <CardDescription>
                Personalize suas notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sound">Som de notificação</Label>
                  <p className="text-sm text-muted-foreground">
                    Tocar som quando receber notificações
                  </p>
                </div>
                <Switch
                  id="sound"
                  checked={settings.sound_enabled}
                  onCheckedChange={(checked) => 
                    updateSettings({ sound_enabled: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="desktop">Notificações do sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar notificações na área de trabalho
                  </p>
                </div>
                <Switch
                  id="desktop"
                  checked={settings.desktop_notifications}
                  onCheckedChange={(checked) => 
                    updateSettings({ desktop_notifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="orders">Notificações de pedidos</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações sobre novos pedidos
                  </p>
                </div>
                <Switch
                  id="orders"
                  checked={settings.order_notifications}
                  onCheckedChange={(checked) => 
                    updateSettings({ order_notifications: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="system">Notificações do sistema</Label>
                  <p className="text-sm text-muted-foreground">
                    Receber notificações do sistema
                  </p>
                </div>
                <Switch
                  id="system"
                  checked={settings.system_notifications}
                  onCheckedChange={(checked) => 
                    updateSettings({ system_notifications: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Ações
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleMarkAllAsRead}
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
              
              <Button
                variant="outline"
                className="w-full text-red-600 hover:text-red-700"
                onClick={handleDeleteAll}
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar todas
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
