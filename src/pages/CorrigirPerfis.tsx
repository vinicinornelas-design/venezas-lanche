import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { User, Shield, UserCheck, AlertTriangle } from "lucide-react";

interface UserProfile {
  id: string;
  nome: string;
  papel: string;
  ativo: boolean | null;
  user_id: string | null;
  email?: string;
}

export default function CorrigirPerfis() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id,
          nome,
          papel,
          ativo,
          user_id,
          auth.users!inner(email)
        `);

      if (error) throw error;

      // Transformar os dados para incluir email
      const profilesWithEmail = data?.map(profile => ({
        ...profile,
        email: profile.auth?.users?.email || 'N/A'
      })) || [];

      setProfiles(profilesWithEmail);
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar perfis de usuários",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (profileId: string, newRole: string) => {
    try {
      setUpdating(profileId);
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          papel: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;

      // Atualizar a lista local
      setProfiles(prev => 
        prev.map(profile => 
          profile.id === profileId 
            ? { ...profile, papel: newRole }
            : profile
        )
      );

      toast({
        title: "Sucesso",
        description: `Perfil atualizado para ${newRole}`,
      });
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar perfil do usuário",
        variant: "destructive",
      });
    } finally {
      setUpdating(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'FUNCIONARIO':
        return <User className="h-4 w-4 text-blue-500" />;
      default:
        return <UserCheck className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'FUNCIONARIO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Carregando perfis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Corrigir Perfis de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie e corrija os papéis dos usuários do sistema
          </p>
        </div>
        <Button onClick={fetchProfiles} variant="outline">
          Atualizar Lista
        </Button>
      </div>

      <div className="grid gap-4">
        {profiles.map((profile) => (
          <Card key={profile.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getRoleIcon(profile.papel)}
                  <div>
                    <CardTitle className="text-lg">{profile.nome}</CardTitle>
                    <CardDescription>{profile.email}</CardDescription>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(profile.papel)}`}>
                  {profile.papel}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-sm font-medium mb-2 block">
                    Alterar Papel:
                  </label>
                  <Select
                    value={profile.papel}
                    onValueChange={(newRole) => updateUserRole(profile.id, newRole)}
                    disabled={updating === profile.id}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Administrador
                        </div>
                      </SelectItem>
                      <SelectItem value="FUNCIONARIO">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Funcionário
                        </div>
                      </SelectItem>
                      <SelectItem value="CAIXA">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Caixa
                        </div>
                      </SelectItem>
                      <SelectItem value="CHAPEIRO">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Chapeiro
                        </div>
                      </SelectItem>
                      <SelectItem value="ATENDENTE">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Atendente
                        </div>
                      </SelectItem>
                      <SelectItem value="COZINHEIRA">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4" />
                          Cozinheira
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  Status: {profile.ativo ? 'Ativo' : 'Inativo'}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {profiles.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum perfil encontrado</h3>
            <p className="text-muted-foreground">
              Não há perfis de usuários cadastrados no sistema.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
