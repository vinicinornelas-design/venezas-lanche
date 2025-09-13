import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  ShoppingCart, 
  Info, 
  AlertTriangle, 
  CheckCircle,
  X,
  Clock,
  User,
  MapPin,
  DollarSign
} from 'lucide-react';
import { AppNotification } from '@/types/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface NotificationItemProps {
  notification: AppNotification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getIcon = () => {
    switch (notification.type) {
      case 'NEW_ORDER':
        return <ShoppingCart className="h-4 w-4" />;
      case 'ORDER_UPDATE':
        return <CheckCircle className="h-4 w-4" />;
      case 'SYSTEM':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPriorityColor = () => {
    switch (notification.priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeColor = () => {
    switch (notification.type) {
      case 'NEW_ORDER':
        return 'text-green-600';
      case 'ORDER_UPDATE':
        return 'text-blue-600';
      case 'SYSTEM':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'há pouco tempo';
    }
  };

  const handleMarkAsRead = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Card 
      className={`transition-all duration-200 cursor-pointer ${
        notification.read 
          ? 'bg-gray-50 border-gray-200' 
          : 'bg-white border-orange-200 shadow-sm'
      } ${isHovered ? 'shadow-md' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleMarkAsRead}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-full ${getTypeColor()}`}>
              {getIcon()}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={`font-medium text-sm ${notification.read ? 'text-gray-600' : 'text-gray-900'}`}>
                  {notification.title}
                </h4>
                {!notification.read && (
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                )}
              </div>
              
              <p className={`text-sm mb-2 ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
                {notification.message}
              </p>

              {/* Metadados do pedido */}
              {notification.metadata && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {notification.metadata.order_type && (
                    <Badge variant="outline" className="text-xs">
                      {notification.metadata.order_type}
                    </Badge>
                  )}
                  {notification.metadata.table_number && (
                    <Badge variant="outline" className="text-xs">
                      <MapPin className="h-3 w-3 mr-1" />
                      Mesa {notification.metadata.table_number}
                    </Badge>
                  )}
                  {notification.metadata.customer_name && (
                    <Badge variant="outline" className="text-xs">
                      <User className="h-3 w-3 mr-1" />
                      {notification.metadata.customer_name}
                    </Badge>
                  )}
                  {notification.metadata.total_amount && (
                    <Badge variant="outline" className="text-xs">
                      <DollarSign className="h-3 w-3 mr-1" />
                      R$ {notification.metadata.total_amount.toFixed(2)}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>{formatTime(notification.created_at)}</span>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getPriorityColor()}`}
                >
                  {notification.priority}
                </Badge>
              </div>
            </div>
          </div>

          {isHovered && (
            <div className="flex items-center gap-1 ml-2">
              {!notification.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkAsRead();
                  }}
                >
                  <CheckCircle className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(notification.id);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
