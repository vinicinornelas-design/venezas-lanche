import { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

// Versão simplificada sem verificação de autenticação - sempre permite acesso
export default function AdminRoute({ children }: AdminRouteProps) {
  return <>{children}</>;
}