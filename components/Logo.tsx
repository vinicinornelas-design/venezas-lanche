import { ChefHat } from "lucide-react";

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg'
};

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto shadow-lg relative overflow-hidden ${className}`}>
      {/* Nova logo estilizada com hambúrguer */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Efeito de brilho neon */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 opacity-80 blur-sm"></div>
        
        {/* Distintivo principal */}
        <div className="relative w-3/4 h-3/4 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex flex-col items-center justify-center shadow-lg">
          {/* Texto superior */}
          <div className={`${textSizeClasses[size]} font-bold text-white -mt-1 tracking-tight`}>
            VENEZA'S
          </div>
          
          {/* Ícone do hambúrguer */}
          <div className="flex flex-col items-center justify-center mt-1">
            {/* Pão superior */}
            <div className="w-3/4 h-1.5 bg-yellow-300 rounded-full relative">
              <div className="absolute inset-0 flex justify-center">
                <div className="w-1 h-1 bg-white rounded-full mt-0.5"></div>
                <div className="w-1 h-1 bg-white rounded-full mt-0.5 ml-1"></div>
                <div className="w-1 h-1 bg-white rounded-full mt-0.5 ml-1"></div>
              </div>
            </div>
            
            {/* Carne */}
            <div className="w-3/4 h-1 bg-orange-600 rounded-full"></div>
            
            {/* Pão inferior */}
            <div className="w-3/4 h-1.5 bg-yellow-300 rounded-full"></div>
          </div>
          
          {/* Faixa inferior */}
          <div className="absolute -bottom-1 w-full h-3 bg-orange-600 rounded-sm flex items-center justify-center">
            <div className={`${textSizeClasses[size]} font-bold text-white tracking-wide`}>
              LANCHES
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de fallback com ícone padrão
export function LogoFallback({ size = 'md', className = '' }: Omit<LogoProps, 'showText'>) {
  return (
    <div className={`${sizeClasses[size]} rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center mx-auto shadow-lg ${className}`}>
      <ChefHat className={`${size === 'sm' ? 'w-4 h-4' : size === 'md' ? 'w-6 h-6' : size === 'lg' ? 'w-8 h-8' : 'w-10 h-10'} text-white`} />
    </div>
  );
}
