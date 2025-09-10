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
  const { state } = useSidebar();
  const navigate = useNavigate();
  const userRole: UserRole = 'FUNCIONARIO';
  const userName = 'Usuário';

  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    try {
      console.log('Fazendo logout...');
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
        // Mesmo com erro, redirecionar para auth
        navigate('/auth');
      } else {
        console.log('Logout realizado com sucesso');
        // Limpar dados locais se necessário
        localStorage.clear();
        sessionStorage.clear();
        
        // Redirecionar para página de login
        navigate('/auth');
      }
    } catch (err) {
      console.error('Erro inesperado no logout:', err);
      // Em caso de erro, ainda assim redirecionar
      navigate('/auth');
    }
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

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        <div className="space-y-2">
          <div className="text-sm">
            <p className="font-medium text-gray-900">{userName}</p>
            <p className="text-xs text-gray-500 capitalize">{userRole.toLowerCase()}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}