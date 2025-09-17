import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { GlobalLoading } from "./components/GlobalLoading";
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
import Restaurante from "@/pages/Restaurante";
import ConfiguracaoRestaurante from "@/pages/ConfiguracaoRestaurante";
import Remarketing from "@/pages/Remarketing";
import PainelColaborador from "@/pages/PainelColaborador";
import AtendimentoMesas from "@/pages/AtendimentoMesas";
import Notificacoes from "@/pages/Notificacoes";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <GlobalLoading>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/menu-publico" element={<MenuPublico />} />
            <Route path="/cardapio-publico" element={<MenuPublico />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN']} fallbackPath="/painel-colaborador">
                <AppLayout><Dashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/admin-dashboard" element={
              <ProtectedRoute allowedRoles={['ADMIN']} fallbackPath="/painel-colaborador">
                <AppLayout><AdminDashboard /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/painel-colaborador" element={
              <ProtectedRoute allowedRoles={['CAIXA', 'CHAPEIRO', 'ATENDENTE', 'COZINHEIRA', 'GARCOM', 'ADMIN']}>
                <AppLayout><PainelColaborador /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/atendimento-mesas" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'GARCOM', 'CAIXA']}>
                <AppLayout><AtendimentoMesas /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/pedidos" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CAIXA']}>
                <AppLayout><Pedidos /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/mesas" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'GARCOM', 'CAIXA']}>
                <AppLayout><Mesas /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/clientes" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout><Clientes /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/remarketing" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout><Remarketing /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/funcionarios" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout><Funcionarios /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/financeiro" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout><Financeiro /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/cardapio" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CAIXA']}>
                <AppLayout><GestaoCardapio /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/gestao-cardapio" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CAIXA']}>
                <AppLayout><GestaoCardapio /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/restaurante" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout><Restaurante /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/configuracao-restaurante" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AppLayout><ConfiguracaoRestaurante /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CAIXA']}>
                <AppLayout><Configuracoes /></AppLayout>
              </ProtectedRoute>
            } />
            <Route path="/notificacoes" element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CAIXA']}>
                <AppLayout><Notificacoes /></AppLayout>
              </ProtectedRoute>
            } />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </BrowserRouter>
        </GlobalLoading>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
