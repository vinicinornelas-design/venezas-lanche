import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ChefHat, Loader2, UserCheck, Shield } from "lucide-react";
import { User, Session } from "@supabase/supabase-js";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState("FUNCIONARIO");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    // Verificar login hardcoded do admin
    const adminLoggedIn = localStorage.getItem('admin_logged_in');
    const userRole = localStorage.getItem('user_role');
    
    if (adminLoggedIn === 'true' && userRole === 'ADMIN') {
      navigate('/admin-dashboard');
      return;
    }

    if (session && user) {
      navigate('/dashboard');
    }
  }, [session, user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !nome || !papel) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const redirectUrl = `${window.location.origin}/dashboard`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          nome: nome,
          papel: papel
        }
      }
    });

    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Erro",
          description: "Este email já está cadastrado. Tente fazer login.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro no cadastro",
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Cadastro realizado!",
        description: "Verifique seu email para confirmar a conta.",
      });
    }
    
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Email e senha são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Login hardcoded para admin
      if ((email === 'admin' && password === '123') || 
          (email === 'venezas@gmail.com' && password === 'veneza12') ||
          (email === 'veneza' && password === 'veneza12')) {
        
        const adminName = email === 'admin' ? 'Administrador' : 'Veneza Admin';
        
        // Simular login do admin
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('user_role', 'ADMIN');
        localStorage.setItem('user_name', adminName);
        
        toast({
          title: "Login realizado!",
          description: `Bem-vindo, ${adminName}!`,
        });
        
        navigate('/admin-dashboard');
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast({
            title: "Erro",
            description: "Email ou senha incorretos. Tente admin/123 para administrador",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no login",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        // Buscar o perfil do usuário para determinar o redirecionamento
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('papel')
            .eq('user_id', user.id)
            .single();
          
          if (profile?.papel === 'ADMIN') {
            navigate('/admin-dashboard');
          } else {
            navigate('/painel-colaborador');
          }
        }
      }
    } catch (err) {
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle p-4">
      <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto shadow-lg">
              <img 
                src="/lovable-uploads/venezas-logo.png" 
                alt="Veneza's Lanches" 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.createElement('div');
                  fallback.innerHTML = '<svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10.2 3.2c-.8-.8-2-.8-2.8 0L3.2 7.4c-.8.8-.8 2 0 2.8l4.2 4.2c.8.8 2 .8 2.8 0l4.2-4.2c.8-.8.8-2 0-2.8L10.2 3.2z"/></svg>';
                  e.currentTarget.parentElement?.appendChild(fallback);
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Veneza's Lanches
              </h1>
              <p className="text-muted-foreground">Sistema de Gestão para Hamburgueria</p>
            </div>
          </div>

        <Card className="border-border shadow-elegant animate-fade-in">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl">Acesso ao Sistema</CardTitle>
            <CardDescription>
              Entre com admin/123, veneza/veneza12 ou venezas@gmail.com/veneza12<br />
              ou crie uma conta para funcionários
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Entrar</TabsTrigger>
                <TabsTrigger value="signup">Cadastrar</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin ou venezas@gmail.com"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Senha</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="123 para admin / veneza12 para Veneza"
                      disabled={loading}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      "Entrar"
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-nome">Nome Completo</Label>
                    <Input
                      id="signup-nome"
                      type="text"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                      placeholder="Seu nome completo"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Senha</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-papel">Tipo de Usuário</Label>
                    <Select value={papel} onValueChange={setPapel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FUNCIONARIO">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            Funcionário
                          </div>
                        </SelectItem>
                        <SelectItem value="ADMIN">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Administrador
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transition-all duration-300"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Cadastrando...
                      </>
                    ) : (
                      "Cadastrar"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              Sistema para gestão completa de hamburgueria
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}