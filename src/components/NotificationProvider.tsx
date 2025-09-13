import { useState, useEffect } from 'react';
import { NotificationToast } from './NotificationToast';
import { useNotifications } from '@/hooks/useNotifications';
import { supabase } from '@/integrations/supabase/client';

export function NotificationProvider() {
  const { toastNotification, closeToast, markToastAsRead } = useNotifications();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  console.log('NotificationProvider renderizado, isAuthenticated:', isAuthenticated, 'toastNotification:', toastNotification);

  if (!isAuthenticated || !toastNotification) return null;

  return (
    <NotificationToast
      notification={toastNotification}
      onClose={closeToast}
      onMarkAsRead={markToastAsRead}
    />
  );
}
