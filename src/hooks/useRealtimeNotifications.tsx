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
    // Sistema de notificações simplificado - sem autenticação
    console.log('Sistema de notificações inicializado (modo simplificado)');
    
    // Não fazer subscribe no Supabase para evitar erros de autenticação
    return () => {
      // Cleanup vazio
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