import { useState, useEffect } from "react";
import { 
  Home, 
  ShoppingCart, 
  Users, 
  UserCheck, 
  BarChart3, 
  Settings,
  ChefHat,
  Table,
  MessageSquare,
  Receipt,
  Building2,
  LogOut
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

type UserRole = 'ADMIN' | 'FUNCIONARIO' | 'CAIXA' | 'CHAPEIRO' | 'ATENDENTE' | 'COZINHEIRA';

interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  roles: UserRole[];
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/admin-dashboard",
    icon: Home,
    roles: ['ADMIN']
  },
  {
    title: "Painel Colaborador",
    url: "/painel-colaborador",
    icon: UserCheck,
    roles: ['FUNCIONARIO', 'CAIXA', 'CHAPEIRO', 'ATENDENTE', 'COZINHEIRA']
  },
  {
    title: "Pedidos",
    url: "/pedidos",
    icon: ShoppingCart,
    roles: ['ADMIN', 'FUNCIONARIO', 'CAIXA', 'CHAPEIRO', 'ATENDENTE', 'COZINHEIRA']
  },
  {
    title: "Mesas",
    url: "/mesas",
    icon: Table,
    roles: ['ADMIN', 'FUNCIONARIO', 'ATENDENTE']
  },
  {
    title: "Cardápio",
    url: "/cardapio",
    icon: ChefHat,
    roles: ['ADMIN']
  },
  {
    title: "Funcionários",
    url: "/funcionarios",
    icon: UserCheck,
    roles: ['ADMIN']
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
    roles: ['ADMIN']
  },
  {
    title: "Remarketing",
    url: "/remarketing",
    icon: MessageSquare,
    roles: ['ADMIN']
  },
  {
    title: "Relatórios",
    url: "/relatorios",
    icon: BarChart3,
    roles: ['ADMIN']
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: Receipt,
    roles: ['ADMIN']
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    roles: ['ADMIN']
  },
  {
    title: "Restaurante",
    url: "/restaurante",
    icon: Building2,
    roles: ['ADMIN']
  }
];

export function AppSidebar() {
  const { state, open, setOpen } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<UserRole>('FUNCIONARIO');
  const [userName, setUserName] = useState<string>('');

  const isCollapsed = state === "collapsed";

  useEffect(() => {
    const fetchUserProfile = async () => {
      // Verificar login hardcoded primeiro  
      const adminLoggedIn = localStorage.getItem('admin_logged_in');
      const userRole = localStorage.getItem('user_role');
      const userName = localStorage.getItem('user_name');
      
      if (adminLoggedIn === 'true' && userRole === 'ADMIN') {
        setUserName(userName || 'Administrador');
        setUserRole('ADMIN' as UserRole);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('nome, papel')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          setUserName(profile.nome);
          setUserRole(profile.papel as UserRole);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    // Limpar login hardcoded se existir
    localStorage.removeItem('admin_logged_in');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro",
        description: "Erro ao fazer logout",
        variant: "destructive",
      });
    } else {
      navigate('/auth');
    }
  };

  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    `w-full justify-start transition-all duration-200 ${
      isActive 
        ? "bg-primary text-primary-foreground shadow-warm" 
        : "hover:bg-accent hover:text-accent-foreground"
    }`;

  return (
    <Sidebar
      className={`${isCollapsed ? "w-14" : "w-64"} transition-all duration-300 border-r border-border bg-card shadow-md`}
      collapsible="icon"
    >
      <SidebarHeader className="border-b border-border p-4 bg-card">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">LancheFlow</h2>
              <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center mx-auto">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent className="bg-card">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            {!isCollapsed && "Navegação"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavClassName}>
                      <item.icon className="w-4 h-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4 bg-card">
        {!isCollapsed && (
          <div className="space-y-2">
            <div className="text-sm">
              <p className="font-medium text-foreground">{userName}</p>
              <p className="text-xs text-muted-foreground capitalize">{userRole.toLowerCase()}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 px-2 py-1 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sair
            </button>
          </div>
        )}
        {isCollapsed && (
          <button
            onClick={handleLogout}
            className="w-8 h-8 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors mx-auto"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </SidebarFooter>

      <SidebarTrigger className="absolute -right-3 top-6 bg-background border border-border rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow" />
    </Sidebar>
  );
}