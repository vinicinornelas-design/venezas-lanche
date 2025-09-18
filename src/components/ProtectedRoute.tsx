import { ReactNode } from 'react';

type UserRole = 'ADMIN' | 'CAIXA' | 'CHAPEIRO' | 'ATENDENTE' | 'COZINHEIRA' | 'GARCOM';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

// Versão simplificada sem autenticação - permite acesso direto
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Retorna diretamente o conteúdo sem verificação de autenticação
  return <>{children}</>;
}
