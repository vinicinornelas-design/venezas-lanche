import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { AppNotification, NotificationSettings } from '@/types/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<NotificationSettings>({
    sound_enabled: true,
    desktop_notifications: true,
    email_notifications: false,
    order_notifications: true,
    system_notifications: true,
  });
  const { toast } = useToast();

  // Carregar notificações iniciais
  useEffect(() => {
    fetchNotifications();
    setupRealtimeSubscription();
  }, []);

  // Atualizar contador de não lidas
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Verificar se a notificação é para o usuário atual
          if (shouldShowNotification(newNotification)) {
            setNotifications(prev => [newNotification, ...prev]);
            showDesktopNotification(newNotification);
            playNotificationSound();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const shouldShowNotification = (notification: AppNotification): boolean => {
    // Verificar se o usuário tem o papel correto
    const userRole = localStorage.getItem('user_role') || 'CAIXA';
    
    // Notificações para CAIXA (novos pedidos)
    if (notification.target_role === 'CAIXA' || notification.target_role === null) {
      return true;
    }
    
    return false;
  };

  const showDesktopNotification = (notification: AppNotification) => {
    if (!settings.desktop_notifications || !('Notification' in window)) {
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            tag: notification.id,
          });
        }
      });
    }
  };

  const playNotificationSound = () => {
    if (!settings.sound_enabled) return;
    
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback para som do sistema
        console.log('🔔 Nova notificação!');
      });
    } catch (error) {
      console.log('🔔 Nova notificação!');
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      
      if (unreadIds.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true, updated_at: new Date().toISOString() })
        .in('id', unreadIds);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  const createNotification = async (notification: Omit<AppNotification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      throw error;
    }
  };

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    localStorage.setItem('notification_settings', JSON.stringify({ ...settings, ...newSettings }));
  };

  return {
    notifications,
    unreadCount,
    loading,
    settings,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    updateSettings,
    refreshNotifications: fetchNotifications,
  };
}
