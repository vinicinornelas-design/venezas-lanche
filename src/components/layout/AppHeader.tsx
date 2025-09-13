import { LogOut, Calendar, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";

type UserRole = 'ADMIN' | 'CAIXA' | 'CHAPEIRO' | 'ATENDENTE' | 'COZINHEIRA' | 'GARCOM';

export function AppHeader() {
  const [userRole, setUserRole] = useState<UserRole>('CAIXA');
  const [userName, setUserName] = useState('Usuário');
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  useEffect(() => {
    loadUserData();
    updateCurrentDate();
    
    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 AppHeader: Mudança de auth detectada:', { event, session: !!session });
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          loadUserData();
        }
      }
    );

    // Atualizar data a cada minuto
    const dateInterval = setInterval(updateCurrentDate, 60000);

    return () => {
      subscription.unsubscribe();
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

  const loadUserData = async () => {
    try {
      console.log('🔍 AppHeader: Carregando dados do usuário...');
      
      // Verificar login hardcoded do admin
      const adminLoggedIn = localStorage.getItem('admin_logged_in');
      const storedUserRole = localStorage.getItem('user_role');
      const storedUserName = localStorage.getItem('user_name');
      
      console.log('🔍 AppHeader: Dados locais:', { adminLoggedIn, storedUserRole, storedUserName });
      
      if (adminLoggedIn === 'true' && storedUserRole === 'ADMIN') {
        console.log('✅ AppHeader: Usuário admin detectado');
        setUserRole('ADMIN');
        setUserName(storedUserName || 'Administrador');
        setLoading(false);
        return;
      }

      // Verificar autenticação normal do Supabase
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      console.log('🔍 AppHeader: Usuário Supabase:', { user: user?.id, email: user?.email, error: userError });
      
      if (!user) {
        console.log('❌ AppHeader: Nenhum usuário autenticado');
        setUserRole('CAIXA');
        setUserName('Usuário');
        setLoading(false);
        return;
      }

      // Buscar dados do perfil no Supabase
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('nome, papel')
        .eq('user_id', user.id)
        .single();

      console.log('🔍 AppHeader: Perfil encontrado:', { profile, error: profileError });

      // Se perfil não existe, tentar criar automaticamente
      if (!profile && user.email) {
        console.log('⚠️ AppHeader: Perfil não encontrado, tentando criar...');
        
        // Tentar obter o papel dos metadados do usuário
        const userRole = user.user_metadata?.papel || 'CAIXA';
        const userName = user.user_metadata?.nome || user.email.split('@')[0] || 'Usuário';
        
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            nome: userName,
            papel: userRole,
            ativo: true
          })
          .select('nome, papel')
          .single();

        if (newProfile && !createError) {
          console.log('✅ AppHeader: Perfil criado automaticamente:', newProfile);
          profile = newProfile;
        } else {
          console.error('❌ AppHeader: Erro ao criar perfil:', createError);
        }
      }

      if (profile) {
        console.log('✅ AppHeader: Perfil carregado:', { nome: profile.nome, papel: profile.papel });
        setUserName(profile.nome || 'Usuário');
        setUserRole(profile.papel as UserRole || 'CAIXA');
      } else {
        console.log('⚠️ AppHeader: Perfil não encontrado, usando padrão');
        setUserName('Usuário');
        setUserRole('CAIXA');
      }
    } catch (error) {
      console.error('❌ AppHeader: Erro ao carregar dados do usuário:', error);
      setUserName('Usuário');
      setUserRole('CAIXA');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Fazendo logout...');
      
      // Limpar dados locais primeiro
      localStorage.clear();
      sessionStorage.clear();
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
      } else {
        console.log('Logout realizado com sucesso');
      }
      
      // Forçar redirecionamento com window.location para garantir
      window.location.href = '/auth';
      
    } catch (err) {
      console.error('Erro inesperado no logout:', err);
      // Em caso de erro, forçar redirecionamento
      window.location.href = '/auth';
    }
  };

  if (loading) {
    return (
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Carregando...</p>
            </div>
          </div>
        </div>
      </header>
    );
  }

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