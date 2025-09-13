import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

type UserRole = 'ADMIN' | 'CAIXA' | 'CHAPEIRO' | 'ATENDENTE' | 'COZINHEIRA' | 'GARCOM';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export function ProtectedRoute({ children, allowedRoles, fallbackPath = '/painel-colaborador' }: ProtectedRouteProps) {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      // Verificar login hardcoded do admin primeiro
      const adminLoggedIn = localStorage.getItem('admin_logged_in');
      const storedUserRole = localStorage.getItem('user_role');
      
      if (adminLoggedIn === 'true' && storedUserRole === 'ADMIN') {
        setUserRole('ADMIN');
        setLoading(false);
        return;
      }

      // Verificar usuário autenticado no Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('papel')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const role = profile.papel as UserRole;
        setUserRole(role);
        
        // Verificar se o usuário tem permissão
        if (!allowedRoles.includes(role)) {
          navigate(fallbackPath);
          return;
        }
      } else {
        // Se não tem perfil, redirecionar para painel colaborador
        navigate(fallbackPath);
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      navigate(fallbackPath);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          <p className="text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!userRole || !allowedRoles.includes(userRole)) {
    return null; // O redirecionamento já foi feito no useEffect
  }

  return <>{children}</>;
}
