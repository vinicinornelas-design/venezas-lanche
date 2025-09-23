import React from 'react';

interface VenezaBannerCustomProps {
  className?: string;
}

export default function VenezaBannerCustom({ className = "" }: VenezaBannerCustomProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Background com gradiente veneziano */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-red-900 to-amber-800"></div>
      
      {/* Padrão de fundo veneziano */}
      <div className="absolute inset-0 opacity-20">
        {/* Círculos decorativos */}
        <div className="absolute top-4 left-4 w-16 h-16 border-2 border-amber-300 rounded-full"></div>
        <div className="absolute top-8 right-8 w-12 h-12 border-2 border-amber-300 rounded-full"></div>
        <div className="absolute bottom-6 left-8 w-8 h-8 border-2 border-amber-300 rounded-full"></div>
        <div className="absolute bottom-4 right-6 w-10 h-10 border-2 border-amber-300 rounded-full"></div>
        
        {/* Silhuetas de gondolas */}
        <div className="absolute bottom-0 left-0 w-full h-16">
          <div className="absolute bottom-2 left-4 w-12 h-8 bg-amber-300 opacity-30 rounded-t-full"></div>
          <div className="absolute bottom-2 left-20 w-10 h-6 bg-amber-300 opacity-30 rounded-t-full"></div>
          <div className="absolute bottom-2 right-8 w-14 h-10 bg-amber-300 opacity-30 rounded-t-full"></div>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="relative z-10 flex items-center justify-center h-full px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col items-center space-y-8">
          
          {/* Hambúrguer real centralizado */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Imagem do hambúrguer real */}
              <div className="relative w-80 h-80 lg:w-96 lg:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-amber-300">
                <img 
                  src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Hambúrguer Veneza's Lanches" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback para imagem local se a URL falhar
                    e.currentTarget.src = "/hamburger-fallback.jpg";
                  }}
                />
                {/* Overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                
                {/* Efeitos decorativos ao redor do hambúrguer */}
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
                <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-amber-400 rounded-full animate-pulse opacity-80"></div>
                <div className="absolute top-1/2 -left-8 w-4 h-4 bg-red-400 rounded-full animate-bounce opacity-60" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-1/4 -right-8 w-5 h-5 bg-yellow-300 rounded-full animate-pulse opacity-60" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>

          {/* Banner "SABOR AUTÊNTICO" */}
          <div className="relative">
            <div className="inline-block transform -rotate-2 bg-gradient-to-r from-yellow-400 to-amber-400 px-12 py-6 shadow-2xl rounded-2xl border-4 border-amber-500">
              <p className="text-3xl md:text-4xl font-black text-amber-900 tracking-wide">
                SABOR AUTÊNTICO
              </p>
            </div>
          </div>

          {/* Ícones de menu abaixo */}
          <div className="flex justify-center items-center gap-8 md:gap-12 flex-wrap mt-8">
            {/* Churrasco */}
            <div className="flex flex-col items-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-800 to-red-800 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-amber-200 mt-2">CHURRASCO</p>
            </div>

            {/* Milkshakes */}
            <div className="flex flex-col items-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-800 to-red-800 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-amber-200 mt-2">MILKSHAKES</p>
            </div>

            {/* Fritas */}
            <div className="flex flex-col items-center group">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-800 to-red-800 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <svg className="w-10 h-10 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
              </div>
              <p className="text-sm font-bold text-amber-200 mt-2">FRITAS CROCRANTES</p>
            </div>
          </div>
        </div>
      </div>

      {/* Efeito de brilho geral */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-y-1"></div>
    </div>
  );
}
