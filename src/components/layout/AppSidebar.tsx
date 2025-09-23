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
  UserCog,
  Bell
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";

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

type UserRole = 'ADMIN' | 'CAIXA' | 'CHAPEIRO' | 'ATENDENTE' | 'COZINHEIRA' | 'GARCOM';

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
    roles: ['CAIXA', 'CHAPEIRO', 'ATENDENTE', 'COZINHEIRA', 'GARCOM']
  },
  {
    title: "Gerenciar Pedidos",
    url: "/pedidos",
    icon: ShoppingCart,
    roles: ['ADMIN', 'CAIXA']
  },
  {
    title: "Controle de Mesas",
    url: "/mesas",
    icon: Table,
    roles: ['ADMIN', 'GARCOM', 'CAIXA']
  },
  {
    title: "Atendimento de Mesas",
    url: "/atendimento-mesas",
    icon: UserCheck,
    roles: ['ADMIN', 'GARCOM', 'CAIXA']
  },
  {
    title: "Gestão do Cardápio",
    url: "/cardapio",
    icon: ChefHat,
    roles: ['ADMIN', 'CAIXA']
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
    title: "Financeiro",
    url: "/financeiro",
    icon: DollarSign,
    roles: ['ADMIN']
  },
  {
    title: "Notificações",
    url: "/notificacoes",
    icon: Bell,
    roles: ['ADMIN', 'CAIXA']
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    roles: ['ADMIN', 'CAIXA']
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
  const [userRole] = useState<UserRole>('ADMIN'); // Sempre admin para acesso total

  const isCollapsed = state === "collapsed";

  // Função removida - não precisa mais carregar dados do usuário

  const handleLogoClick = () => {
    navigate('/');
  };



  const filteredItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    `w-full justify-start transition-all duration-200 flex items-center gap-2 px-3 py-2 rounded-md ${
      isActive 
        ? "bg-gradient-to-r from-amber-500 to-red-500 text-white" 
        : "text-amber-800 hover:bg-amber-100 hover:text-amber-900"
    }`;

  // Removido loading state - sempre renderiza diretamente

  return (
    <div className="w-64 bg-gradient-to-b from-amber-50 to-white border-r border-amber-200 shadow-md h-full">
      <div className="p-4 border-b border-amber-200">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleLogoClick}
            className="w-8 h-8 bg-gradient-to-r from-amber-500 to-red-500 rounded-lg flex items-center justify-center hover:from-amber-600 hover:to-red-600 transition-colors cursor-pointer"
            title="Ir para página inicial"
          >
            <ChefHat className="w-4 h-4 text-white" />
          </button>
          <div>
            <h2 className="font-semibold text-amber-900">Veneza's Lanches</h2>
            <p className="text-xs text-amber-600">Sistema de Gestão</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-sm font-medium text-amber-700 mb-3">Navegação</h3>
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