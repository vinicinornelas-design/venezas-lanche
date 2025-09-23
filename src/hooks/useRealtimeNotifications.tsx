import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Audio notification system
class AudioNotificationSystem {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = false;
  
  constructor() {
    // Initialize on user interaction to comply with browser policies
    this.initializeOnUserInteraction();
  }

  private initializeOnUserInteraction() {
    const initAudio = () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.isEnabled = true;
      }
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('touchstart', initAudio);
  }

  async playNewOrderSound() {
    if (!this.audioContext || !this.isEnabled) return;

    try {
      // Create a pleasant notification sound using oscillators
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure the sound - pleasant notification tone
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + 0.5);
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  isAudioEnabled() {
    return this.isEnabled;
  }
}

export function useRealtimeNotifications(enabled: boolean = true) {
  const { toast } = useToast();
  const audioSystem = useRef<AudioNotificationSystem>(new AudioNotificationSystem());

  useEffect(() => {
    if (!enabled) return;

    console.log('🔔 Sistema de notificações de pedidos inicializado');

    // Subscribe para novos pedidos na tabela pedidos_unificados
    const channel = supabase
      .channel('pedidos_notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'pedidos_unificados'
        },
        (payload) => {
          console.log('🔔 Novo pedido detectado:', payload);
          
          const novoPedido = payload.new;
          
          // Tocar som de notificação
          audioSystem.current.playNotificationSound();
          
          // Mostrar toast de notificação
          toast({
            title: "🆕 Novo Pedido!",
            description: `Pedido #${novoPedido.numero_pedido} - ${novoPedido.cliente_nome || 'Cliente não informado'}`,
            duration: 8000,
            action: (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Marcar como visto
                    console.log('Pedido marcado como visto');
                  }}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  Marcar como visto
                </button>
                <button
                  onClick={() => {
                    // Abrir página de pedidos
                    window.location.href = '/pedidos';
                  }}
                  className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded"
                >
                  Conferir pedido
                </button>
              </div>
            ),
          });

          // Salvar notificação no localStorage para persistência
          const notificacao = {
            id: `pedido_${novoPedido.id}`,
            type: 'NEW_ORDER',
            title: 'Novo Pedido',
            message: `Pedido #${novoPedido.numero_pedido} - ${novoPedido.cliente_nome || 'Cliente não informado'}`,
            data: {
              pedido_id: novoPedido.id,
              numero_pedido: novoPedido.numero_pedido,
              cliente_nome: novoPedido.cliente_nome,
              origem: novoPedido.origem,
              total: novoPedido.total
            },
            read: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Salvar no localStorage
          const notificacoesExistentes = JSON.parse(localStorage.getItem('pedidos_notifications') || '[]');
          notificacoesExistentes.unshift(notificacao);
          localStorage.setItem('pedidos_notifications', JSON.stringify(notificacoesExistentes));
        }
      )
      .subscribe();

    return () => {
      console.log('🔔 Limpando subscription de notificações');
      supabase.removeChannel(channel);
    };
  }, [enabled, toast]);

  // Request notification permission on first use
  useEffect(() => {
    if (enabled && typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [enabled]);

  const enableSound = () => audioSystem.current.enable();
  const disableSound = () => audioSystem.current.disable();
  const isSoundEnabled = () => audioSystem.current.isAudioEnabled();

  return {
    enableSound,
    disableSound,
    isSoundEnabled
  };
}