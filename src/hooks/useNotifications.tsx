import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { AppNotification, NotificationSettings } from '@/types/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toastNotification, setToastNotification] = useState<AppNotification | null>(null);
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
    // Usar polling em vez de subscription para evitar erro de binding
    setupPolling();
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

  const setupPolling = () => {
    console.log('Configurando polling de notificações...');
    
    let lastNotificationId: string | null = null;
    
    // Buscar ID da última notificação
    const getLastNotificationId = () => {
      if (notifications.length > 0) {
        return notifications[0].id;
      }
      return null;
    };
    
    const checkForNewNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('target_role', 'CAIXA')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        if (data && data.length > 0) {
          const latestNotification = data[0];
          
          // Verificar se é uma nova notificação
          if (!lastNotificationId || latestNotification.id !== lastNotificationId) {
            console.log('Nova notificação detectada via polling:', latestNotification);
            
            if (shouldShowNotification(latestNotification)) {
              console.log('Mostrando notificação via polling:', latestNotification);
              setNotifications(prev => {
                // Evitar duplicatas
                const exists = prev.some(n => n.id === latestNotification.id);
                if (exists) return prev;
                return [latestNotification, ...prev];
              });
              showDesktopNotification(latestNotification);
              playNotificationSound();
            }
            
            lastNotificationId = latestNotification.id;
          }
        }
      } catch (error) {
        console.error('Erro no polling de notificações:', error);
      }
    };

    // Verificar a cada 3 segundos
    const interval = setInterval(checkForNewNotifications, 3000);
    
    // Verificar imediatamente
    checkForNewNotifications();

    return () => {
      console.log('Removendo polling de notificações');
      clearInterval(interval);
    };
  };

  const shouldShowNotification = (notification: AppNotification): boolean => {
    // Notificações para CAIXA (novos pedidos) - sempre mostrar para CAIXA
    if (notification.target_role === 'CAIXA' || notification.target_role === null) {
      return true;
    }
    
    return false;
  };

  const showDesktopNotification = (notification: AppNotification) => {
    // Mostrar toast notification personalizado (popup na tela)
    setToastNotification(notification);
    
    // Auto-remover após 8 segundos
    setTimeout(() => {
      setToastNotification(null);
    }, 8000);

    // Mostrar notificação do sistema (se habilitado)
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
      // Tentar tocar som personalizado primeiro
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback: usar som do sistema
        playSystemSound();
      });
    } catch (error) {
      // Fallback: usar som do sistema
      playSystemSound();
    }
  };

  const playSystemSound = () => {
    try {
      // Criar um som simples usando Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Verificar se o contexto está suspenso e resumir se necessário
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          playTone(audioContext);
        });
      } else {
        playTone(audioContext);
      }
    } catch (error) {
      console.log('🔔 Nova notificação!');
    }
  };

  const playTone = (audioContext: AudioContext) => {
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Som de notificação mais agradável
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      console.log('🔊 Som de notificação reproduzido');
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

  const closeToast = () => {
    setToastNotification(null);
  };

  const markToastAsRead = async () => {
    if (toastNotification) {
      await markAsRead(toastNotification.id);
      setToastNotification(null);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    settings,
    toastNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    updateSettings,
    refreshNotifications: fetchNotifications,
    closeToast,
    markToastAsRead,
  };
}
