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
  DollarSign,
  UserCog
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
    title: "Gerenciar Pedidos",
    url: "/pedidos",
    icon: ShoppingCart,
    roles: ['ADMIN', 'FUNCIONARIO', 'CAIXA', 'CHAPEIRO', 'ATENDENTE', 'COZINHEIRA']
  },
  {
    title: "Controle de Mesas",
    url: "/mesas",
    icon: Table,
    roles: ['ADMIN', 'FUNCIONARIO', 'ATENDENTE']
  },
  {
    title: "Atendimento de Mesas",
    url: "/atendimento-mesas",
    icon: UserCheck,
    roles: ['FUNCIONARIO', 'ATENDENTE', 'GARCOM']
  },
  {
    title: "Gestão do Cardápio",
    url: "/cardapio",
    icon: ChefHat,
    roles: ['ADMIN']
  },
  {
    title: "Funcionários",
    url: "/funcionarios",
    icon: UserCog,
    roles: ['ADMIN']
  },
  {
    title: "Clientes",
    url: "/clientes",
    icon: Users,
    roles: ['ADMIN']
  },
  {
    title: "Análise Completa",
    url: "/relatorios",
    icon: BarChart3,
    roles: ['ADMIN']
  },
  {
    title: "Financeiro",
    url: "/financeiro",
    icon: DollarSign,
    roles: ['ADMIN']
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    roles: ['ADMIN']
  },
  {
    title: "Remarketing",
    url: "/remarketing",
    icon: MessageSquare,
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
  const { state } = useSidebar();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>('FUNCIONARIO');
  const [loading, setLoading] = useState(true);

  const isCollapsed = state === "collapsed";

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      // Verificar login hardcoded do admin
      const adminLoggedIn = localStorage.getItem('admin_logged_in');
      const storedUserRole = localStorage.getItem('user_role');
      
      if (adminLoggedIn === 'true' && storedUserRole === 'ADMIN') {
        setUserRole('ADMIN');
        setLoading(false);
        return;
      }

      // Verificar autenticação normal do Supabase
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setUserRole('FUNCIONARIO');
        setLoading(false);
        return;
      }

      // Buscar dados do perfil no Supabase
      let { data: profile } = await supabase
        .from('profiles')
        .select('papel')
        .eq('user_id', user.id)
        .single();

      // Se perfil não existe, tentar criar automaticamente
      if (!profile && user.email) {
        // Tentar obter o papel dos metadados do usuário
        const userRole = user.user_metadata?.papel || 'FUNCIONARIO';
        const userName = user.user_metadata?.nome || user.email.split('@')[0] || 'Usuário';
        
        const { data: newProfile } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            nome: userName,
            papel: userRole,
            ativo: true
          })
          .select('papel')
          .single();

        if (newProfile) {
          profile = newProfile;
        }
      }

      if (profile) {
        setUserRole(profile.papel as UserRole || 'FUNCIONARIO');
      } else {
        setUserRole('FUNCIONARIO');
      }
    } catch (error) {
      console.error('Erro ao carregar papel do usuário:', error);
      setUserRole('FUNCIONARIO');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoClick = () => {
    navigate('/');
  };



  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    `w-full justify-start transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-md ${
      isActive 
        ? "bg-orange-500 text-white" 
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }`;

  if (loading) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 shadow-md h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">LancheFlow</h2>
              <p className="text-xs text-gray-500">Sistema de Gestão</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Navegação</h3>
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-full h-8 bg-gray-200 rounded-md animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-md h-full">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogoClick}
            className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer"
            title="Ir para página inicial"
          >
            <ChefHat className="w-4 h-4 text-white" />
          </button>
          <div>
            <h2 className="font-semibold text-gray-900">LancheFlow</h2>
            <p className="text-xs text-gray-500">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Navegação</h3>
        <nav className="space-y-1">
          {filteredItems.map((item) => (
            <NavLink 
              key={item.title} 
              to={item.url} 
              className={getNavClassName}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </nav>
      </div>

    </div>
  );
}