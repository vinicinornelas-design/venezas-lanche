import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  X,
  Bell
} from 'lucide-react';
import { AppNotification } from '@/types/notifications';

interface NotificationToastProps {
  notification: AppNotification;
  onClose: () => void;
  onMarkAsRead: () => void;
}

export function NotificationToast({ notification, onClose, onMarkAsRead }: NotificationToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animar entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getIcon = () => {
    switch (notification.type) {
      case 'NEW_ORDER':
        return <ShoppingCart className="h-5 w-5 text-green-600" />;
      case 'ORDER_UPDATE':
        return <CheckCircle className="h-5 w-5 text-blue-600" />;
      case 'SYSTEM':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'URGENT':
        return 'border-red-500 bg-red-50';
      case 'HIGH':
        return 'border-orange-500 bg-orange-50';
      case 'MEDIUM':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-blue-500 bg-blue-50';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <Card className={`w-80 shadow-lg border-2 ${getPriorityColor()}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm text-gray-900">
                  {notification.title}
                </h4>
                <Badge 
                  variant="outline" 
                  className="text-xs"
                >
                  {notification.priority}
                </Badge>
              </div>
              
              <p className="text-sm text-gray-700 mb-2">
                {notification.message}
              </p>

              {/* Metadados do pedido */}
              {notification.metadata && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {notification.metadata.order_type && (
                    <Badge variant="secondary" className="text-xs">
                      {notification.metadata.order_type}
                    </Badge>
                  )}
                  {notification.metadata.total_amount && (
                    <Badge variant="secondary" className="text-xs">
                      R$ {notification.metadata.total_amount.toFixed(2)}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onMarkAsRead}
                  className="text-xs"
                >
                  Marcar como lida
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onClose}
                  className="text-xs"
                >
                  Fechar
                </Button>
              </div>
            </div>

            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
