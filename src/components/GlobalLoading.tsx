import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface GlobalLoadingProps {
  children: React.ReactNode;
}

export function GlobalLoading({ children }: GlobalLoadingProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula um tempo mínimo de carregamento para evitar flash
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
