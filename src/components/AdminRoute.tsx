import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      // Verificar login hardcoded do admin
      const adminLoggedIn = localStorage.getItem('admin_logged_in');
      const userRole = localStorage.getItem('user_role');
      
      if (adminLoggedIn === 'true' && userRole === 'ADMIN') {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Verificar autenticação normal
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('papel')
        .eq('user_id', user.id)
        .single();

      setIsAdmin(profile?.papel === 'ADMIN');
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}