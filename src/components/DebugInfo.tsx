import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function DebugInfo() {
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    const getDebugInfo = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const { data: { user } } = await supabase.auth.getUser();
        setSession(session);
        setUser(user);
      } catch (error) {
        console.error('Error getting debug info:', error);
      }
    };

    getDebugInfo();
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsVisible(!isVisible)}
        size="sm"
        variant="outline"
        className="mb-2"
      >
        Debug
      </Button>
      
      {isVisible && (
        <Card className="w-80 max-h-96 overflow-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Debug Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div>
              <strong>Network:</strong>
              <Badge variant={isOnline ? "default" : "destructive"} className="ml-2">
                {isOnline ? "Online" : "Offline"}
              </Badge>
            </div>
            
            <div>
              <strong>Session:</strong>
              <div className="mt-1 p-2 bg-muted rounded text-xs">
                {session ? (
                  <div>
                    <div>User ID: {session.user?.id}</div>
                    <div>Expires: {new Date(session.expires_at * 1000).toLocaleString()}</div>
                    <div>Provider: {session.user?.app_metadata?.provider}</div>
                  </div>
                ) : (
                  <div>No session</div>
                )}
              </div>
            </div>

            <div>
              <strong>User:</strong>
              <div className="mt-1 p-2 bg-muted rounded text-xs">
                {user ? (
                  <div>
                    <div>Email: {user.email}</div>
                    <div>Created: {new Date(user.created_at).toLocaleString()}</div>
                    <div>Last Sign In: {new Date(user.last_sign_in_at).toLocaleString()}</div>
                  </div>
                ) : (
                  <div>No user</div>
                )}
              </div>
            </div>

            <div>
              <strong>URL:</strong>
              <div className="mt-1 p-2 bg-muted rounded text-xs break-all">
                {window.location.href}
              </div>
            </div>

            <div>
              <strong>User Agent:</strong>
              <div className="mt-1 p-2 bg-muted rounded text-xs break-all">
                {navigator.userAgent}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
