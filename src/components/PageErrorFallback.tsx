import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PageErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
}

export function PageErrorFallback({ 
  error, 
  resetError, 
  title = "Erro ao carregar página",
  description = "Ocorreu um erro inesperado ao carregar esta página."
}: PageErrorFallbackProps) {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h2>
        
        <p className="text-gray-600 mb-6">
          {description}
        </p>

        {error && process.env.NODE_ENV === 'development' && (
          <details className="text-xs bg-gray-100 p-3 rounded mb-4 text-left">
            <summary className="cursor-pointer font-medium mb-2">
              Detalhes do erro (desenvolvimento)
            </summary>
            <pre className="whitespace-pre-wrap text-red-600">
              {error.message}
              {error.stack}
            </pre>
          </details>
        )}

        <div className="flex gap-2 justify-center">
          {resetError && (
            <Button 
              onClick={resetError}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Tentar Novamente
            </Button>
          )}
          
          <Button 
            onClick={handleReload}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Recarregar Página
          </Button>
          
          <Button 
            onClick={handleGoHome}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Ir para Início
          </Button>
        </div>
      </div>
    </div>
  );
}
