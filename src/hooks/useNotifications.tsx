import { useState, useEffect, useCallback } from 'react';
// import { supabase } from '@/integrations/supabase/client'; // Removido para evitar erros
import { useToast } from './use-toast';
import { AppNotification, NotificationSettings } from '@/types/notifications';

export function useNotifications() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false); // Mudado para false para evitar loading infinito
  const [toastNotification, setToastNotification] = useState<AppNotification | null>(null);
  const [settings, setSettings] = useState<NotificationSettings>({
    sound_enabled: true,
    desktop_notifications: true,
    email_notifications: false,
    order_notifications: true,
    system_notifications: true,
  });
  const { toast } = useToast();

  // Carregar notificações iniciais - simplificado sem autenticação
  useEffect(() => {
    // Simular notificações vazias para evitar erros
    setNotifications([]);
    setLoading(false);
  }, []);

  // Atualizar contador de não lidas
  useEffect(() => {
    const count = notifications.filter(n => !n.read).length;
    setUnreadCount(count);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      // Simular notificações vazias para evitar erros
      setNotifications([]);
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    } finally {
      setLoading(false);
    }
  };

  const setupPolling = () => {
    console.log('Polling de notificações desabilitado para evitar erros');
    // Retornar função vazia para evitar erros
    return () => {};
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
      // Simular marcação como lida localmente
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Simular marcação de todas como lidas localmente
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Erro ao marcar todas as notificações como lidas:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Simular deleção localmente
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  const createNotification = async (notification: Omit<AppNotification, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Simular criação de notificação localmente
      const newNotification: AppNotification = {
        ...notification,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      return newNotification;
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
