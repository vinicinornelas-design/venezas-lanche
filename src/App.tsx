import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import WelcomePage from "./pages/WelcomePage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Pedidos from "./pages/Pedidos";
import Mesas from "./pages/Mesas";
import Funcionarios from "./pages/Funcionarios";
import Configuracoes from "@/pages/Configuracoes";
import Financeiro from "@/pages/Financeiro";
import GestaoCardapio from "@/pages/GestaoCardapio"; 
import MenuPublico from "@/pages/MenuPublico";
import Clientes from "@/pages/Clientes";
import Relatorios from "@/pages/Relatorios";
import Restaurante from "@/pages/Restaurante";
import ConfiguracaoRestaurante from "@/pages/ConfiguracaoRestaurante";
import Remarketing from "@/pages/Remarketing";
import PainelColaborador from "@/pages/PainelColaborador";
import AtendimentoMesas from "@/pages/AtendimentoMesas";
import CorrigirPerfis from "@/pages/CorrigirPerfis";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/menu-publico" element={<MenuPublico />} />
            <Route path="/cardapio-publico" element={<MenuPublico />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
            <Route path="/admin-dashboard" element={<AppLayout><AdminDashboard /></AppLayout>} />
            <Route path="/painel-colaborador" element={<AppLayout><PainelColaborador /></AppLayout>} />
            <Route path="/atendimento-mesas" element={<AppLayout><AtendimentoMesas /></AppLayout>} />
              <Route path="/pedidos" element={<AppLayout><Pedidos /></AppLayout>} />
              <Route path="/mesas" element={<AppLayout><Mesas /></AppLayout>} />
              <Route path="/clientes" element={<AppLayout><Clientes /></AppLayout>} />
              <Route path="/remarketing" element={<AppLayout><Remarketing /></AppLayout>} />
              <Route path="/funcionarios" element={<AppLayout><Funcionarios /></AppLayout>} />
              <Route path="/financeiro" element={<AppLayout><Financeiro /></AppLayout>} />
              <Route path="/relatorios" element={<AppLayout><Relatorios /></AppLayout>} />
              <Route path="/cardapio" element={<AppLayout><GestaoCardapio /></AppLayout>} />
              <Route path="/gestao-cardapio" element={<AppLayout><GestaoCardapio /></AppLayout>} />
              <Route path="/restaurante" element={<AppLayout><Restaurante /></AppLayout>} />
              <Route path="/configuracao-restaurante" element={<AppLayout><ConfiguracaoRestaurante /></AppLayout>} />
              <Route path="/configuracoes" element={<AppLayout><Configuracoes /></AppLayout>} />
              <Route path="/corrigir-perfis" element={<AppLayout><CorrigirPerfis /></AppLayout>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
