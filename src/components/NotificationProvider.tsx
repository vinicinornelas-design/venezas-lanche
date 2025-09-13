import { NotificationToast } from './NotificationToast';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationProvider() {
  const { toastNotification, closeToast, markToastAsRead } = useNotifications();

  if (!toastNotification) return null;

  return (
    <NotificationToast
      notification={toastNotification}
      onClose={closeToast}
      onMarkAsRead={markToastAsRead}
    />
  );
}
