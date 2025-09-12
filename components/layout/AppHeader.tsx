import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

type UserRole = 'ADMIN' | 'FUNCIONARIO' | 'CAIXA' | 'CHAPEIRO' | 'ATENDENTE' | 'COZINHEIRA';

export function AppHeader() {
  const [userRole, setUserRole] = useState<UserRole>('FUNCIONARIO');
  const [userName, setUserName] = useState('Usuário');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      // Verificar login hardcoded do admin
      const adminLoggedIn = localStorage.getItem('admin_logged_in');
      const storedUserRole = localStorage.getItem('user_role');
      const storedUserName = localStorage.getItem('user_name');
      
      if (adminLoggedIn === 'true' && storedUserRole === 'ADMIN') {
        setUserRole('ADMIN');
        setUserName(storedUserName || 'Administrador');
        setLoading(false);
        return;
      }

      // Verificar autenticação normal do Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserRole('FUNCIONARIO');
        setUserName('Usuário');
        setLoading(false);
        return;
      }

      // Buscar dados do perfil no Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('nome, papel')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserName(profile.nome || 'Usuário');
        setUserRole(profile.papel as UserRole || 'FUNCIONARIO');
      } else {
        setUserName('Usuário');
        setUserRole('FUNCIONARIO');
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      setUserName('Usuário');
      setUserRole('FUNCIONARIO');
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
        
        <div className="flex items-center gap-4">
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