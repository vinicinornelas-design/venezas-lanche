import { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

type UserRole = 'ADMIN' | 'CAIXA' | 'CHAPEIRO' | 'ATENDENTE' | 'COZINHEIRA' | 'GARCOM';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export function ProtectedRoute({ children, allowedRoles, fallbackPath = '/auth' }: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate(fallbackPath);
          return;
        }

        setUser(user);

        // Buscar o papel do usuário
        const { data: profile } = await supabase
          .from('profiles')
          .select('papel')
          .eq('user_id', user.id)
          .single();

        if (profile?.papel) {
          setUserRole(profile.papel as UserRole);
          
          // Verificar se o usuário tem permissão para acessar esta rota
          if (!allowedRoles.includes(profile.papel as UserRole)) {
            // Redirecionar para o dashboard apropriado baseado no papel
            if (profile.papel === 'ADMIN') {
              navigate('/admin-dashboard');
            } else {
              navigate('/painel-colaborador');
            }
            return;
          }
        } else {
          // Se não tem perfil, redirecionar para auth
          navigate(fallbackPath);
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        navigate(fallbackPath);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        navigate(fallbackPath);
      }
    });

    return () => subscription.unsubscribe();
  }, [allowedRoles, fallbackPath, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user || !userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
