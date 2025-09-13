export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'NEW_ORDER' | 'ORDER_UPDATE' | 'SYSTEM' | 'INFO';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  read: boolean;
  created_at: string;
  updated_at: string;
  target_role: string | null;
  order_id?: string;
  metadata?: {
    order_type?: 'MESA' | 'DELIVERY' | 'BALCAO';
    table_number?: number;
    customer_name?: string;
    total_amount?: number;
  };
}

export interface NotificationSettings {
  sound_enabled: boolean;
  desktop_notifications: boolean;
  email_notifications: boolean;
  order_notifications: boolean;
  system_notifications: boolean;
}

export type NotificationType = Notification['type'];
export type NotificationPriority = Notification['priority'];
