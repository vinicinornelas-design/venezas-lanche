import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, LogOut, RefreshCw } from 'lucide-react';

export function UserDebugInfo() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const getDebugInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: { user } } = await supabase.auth.getUser();
        
        setSession(session);
        setUser(user);
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error getting debug info:', error);
      }
    };

    getDebugInfo();
  }, []);

  const refreshInfo = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: { user } } = await supabase.auth.getUser();
      
      setSession(session);
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setProfile(profile);
      }
    } catch (error) {
      console.error('Error refreshing debug info:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 shadow-lg"
      >
        <User className="w-5 h-5" />
      </Button>
      
      {isVisible && (
        <Card className="absolute bottom-16 right-0 w-80 max-h-96 overflow-y-auto shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Debug - Usuário</CardTitle>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={refreshInfo}>
                  <RefreshCw className="w-3 h-3" />
                </Button>
                <Button size="sm" variant="destructive" onClick={handleLogout}>
                  <LogOut className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-xs">
            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Session:</h4>
              <div className="bg-gray-50 p-2 rounded text-xs">
                {session ? (
                  <div>
                    <p><strong>Access Token:</strong> {session.access_token ? 'Presente' : 'Ausente'}</p>
                    <p><strong>Expires:</strong> {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'N/A'}</p>
                  </div>
                ) : (
                  <p className="text-red-600">Nenhuma sessão ativa</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-1">User:</h4>
              <div className="bg-gray-50 p-2 rounded text-xs">
                {user ? (
                  <div>
                    <p><strong>ID:</strong> {user.id}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
                    <p><strong>Last Sign In:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
                  </div>
                ) : (
                  <p className="text-red-600">Nenhum usuário logado</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Profile:</h4>
              <div className="bg-gray-50 p-2 rounded text-xs">
                {profile ? (
                  <div>
                    <p><strong>Nome:</strong> {profile.nome || 'N/A'}</p>
                    <p><strong>Papel:</strong> 
                      <Badge variant="outline" className="ml-1 text-xs">
                        {profile.papel || 'N/A'}
                      </Badge>
                    </p>
                    <p><strong>Ativo:</strong> {profile.ativo ? 'Sim' : 'Não'}</p>
                    <p><strong>Created:</strong> {new Date(profile.created_at).toLocaleString()}</p>
                  </div>
                ) : (
                  <p className="text-red-600">Perfil não encontrado</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-700 mb-1">Local Storage:</h4>
              <div className="bg-gray-50 p-2 rounded text-xs">
                <p><strong>admin_logged_in:</strong> {localStorage.getItem('admin_logged_in') || 'N/A'}</p>
                <p><strong>user_role:</strong> {localStorage.getItem('user_role') || 'N/A'}</p>
                <p><strong>user_name:</strong> {localStorage.getItem('user_name') || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
