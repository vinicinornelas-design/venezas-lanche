import { LogOut, Calendar, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

type UserRole = 'ADMIN' | 'CAIXA' | 'CHAPEIRO' | 'ATENDENTE' | 'COZINHEIRA' | 'GARCOM';

export function AppHeader() {
  const [userRole] = useState<UserRole>('ADMIN'); // Sempre admin para acesso total
  const [userName] = useState('Administrador');
  const [currentDate, setCurrentDate] = useState('');
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    updateCurrentDate();
    
    // Atualizar data a cada minuto
    const dateInterval = setInterval(updateCurrentDate, 60000);

    return () => {
      clearInterval(dateInterval);
    };
  }, []);

  const updateCurrentDate = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(formattedDate);
  };

  // Função removida - não precisa mais carregar dados do usuário

  const handleLogout = () => {
    // Redirecionar para a página inicial
    navigate('/');
  };

  // Removido loading state - sempre renderiza diretamente

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Data atual */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{currentDate}</span>
          </div>
          
          {/* Botão de notificações */}
          {(userRole === 'ADMIN' || userRole === 'CAIXA') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notificacoes')}
              className="relative"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          )}
          
          {/* Informações do usuário */}
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole.toLowerCase()}</p>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-3 py-2 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>
    </header>
  );
}