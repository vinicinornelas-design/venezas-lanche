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
  LogOut,
  DollarSign,
  UserCog
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

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
  
  // Estados para contadores dinâmicos
  const [counters, setCounters] = useState({
    pedidosPendentes: 0,
    mesasOcupadas: 0,
    itensCardapio: 0,
    funcionariosAtivos: 0,
    clientes: 0
  });

  const isCollapsed = state === "collapsed";

  // Buscar contadores do banco de dados
  useEffect(() => {
    const fetchCounters = async () => {
      try {
        // Pedidos pendentes
        const { count: pedidosPendentes } = await supabase
          .from('pedidos')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'PENDENTE');

        // Mesas ocupadas
        const { count: mesasOcupadas } = await supabase
          .from('mesas')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'OCUPADA');

        // Itens do cardápio
        const { count: itensCardapio } = await supabase
          .from('itens_cardapio')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true);

        // Funcionários ativos
        const { count: funcionariosAtivos } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('ativo', true)
          .neq('papel', 'ADMIN');

        // Clientes (aproximação baseada em pedidos únicos)
        const { count: clientes } = await supabase
          .from('pedidos')
          .select('cliente_nome', { count: 'exact', head: true });

        setCounters({
          pedidosPendentes: pedidosPendentes || 0,
          mesasOcupadas: mesasOcupadas || 0,
          itensCardapio: itensCardapio || 0,
          funcionariosAtivos: funcionariosAtivos || 0,
          clientes: clientes || 0
        });
      } catch (error) {
        console.error('Erro ao buscar contadores:', error);
        // Usar valores padrão em caso de erro
        setCounters({
          pedidosPendentes: 1,
          mesasOcupadas: 1,
          itensCardapio: 17,
          funcionariosAtivos: 2,
          clientes: 0
        });
      }
    };

    fetchCounters();
  }, []);

  const handleLogout = async () => {
    try {
      console.log('Fazendo logout...');
      
      // Limpar dados locais primeiro
      localStorage.clear();
      sessionStorage.clear();
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro ao fazer logout:', error);
      } else {
        console.log('Logout realizado com sucesso');
      }
      
      // Forçar redirecionamento com window.location para garantir
      window.location.href = '/auth';
      
    } catch (err) {
      console.error('Erro inesperado no logout:', err);
      // Em caso de erro, forçar redirecionamento
      window.location.href = '/auth';
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

        {/* Seção Administrativa */}
        {userRole === 'ADMIN' && (
          <div className="mt-8">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Funcionalidades Administrativas</h3>
            <div className="space-y-2">
              {/* Gerenciar Pedidos */}
              <NavLink 
                to="/pedidos" 
                className={getNavClassName}
              >
                <ShoppingCart className="w-4 h-4" />
                <div className="flex-1">
                  <span>Gerenciar Pedidos</span>
                  <span className="text-xs text-orange-600 ml-2">{counters.pedidosPendentes} pendentes</span>
                </div>
              </NavLink>

              {/* Controle de Mesas */}
              <NavLink 
                to="/mesas" 
                className={getNavClassName}
              >
                <Table className="w-4 h-4" />
                <div className="flex-1">
                  <span>Controle de Mesas</span>
                  <span className="text-xs text-blue-600 ml-2">{counters.mesasOcupadas} ocupadas</span>
                </div>
              </NavLink>

              {/* Gestão do Cardápio */}
              <NavLink 
                to="/cardapio" 
                className={getNavClassName}
              >
                <ChefHat className="w-4 h-4" />
                <div className="flex-1">
                  <span>Gestão do Cardápio</span>
                  <span className="text-xs text-green-600 ml-2">{counters.itensCardapio} itens</span>
                </div>
              </NavLink>

              {/* Funcionários */}
              <NavLink 
                to="/funcionarios" 
                className={getNavClassName}
              >
                <UserCog className="w-4 h-4" />
                <div className="flex-1">
                  <span>Funcionários</span>
                  <span className="text-xs text-purple-600 ml-2">{counters.funcionariosAtivos} ativos</span>
                </div>
              </NavLink>

              {/* Clientes */}
              <NavLink 
                to="/clientes" 
                className={getNavClassName}
              >
                <Users className="w-4 h-4" />
                <div className="flex-1">
                  <span>Clientes</span>
                  <span className="text-xs text-gray-600 ml-2">{counters.clientes} cadastrados</span>
                </div>
              </NavLink>

              {/* Análise Completa */}
              <NavLink 
                to="/relatorios" 
                className={getNavClassName}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Análise Completa</span>
              </NavLink>

              {/* Financeiro */}
              <NavLink 
                to="/financeiro" 
                className={getNavClassName}
              >
                <DollarSign className="w-4 h-4" />
                <span>Financeiro</span>
              </NavLink>

              {/* Configurações */}
              <NavLink 
                to="/configuracoes" 
                className={getNavClassName}
              >
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </NavLink>
            </div>
          </div>
        )}
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