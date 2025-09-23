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
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Lado esquerdo - Texto e branding */}
          <div className="text-center lg:text-left space-y-6">
            {/* Logo principal */}
            <div className="mb-8">
              <div className="inline-block bg-gradient-to-r from-amber-100 to-amber-50 rounded-3xl px-8 py-6 shadow-2xl border-4 border-amber-300">
                <h1 className="text-4xl md:text-5xl font-bold text-amber-900 mb-2 font-serif">
                  Veneza's Lanches
                </h1>
                <p className="text-lg md:text-xl text-amber-800 font-semibold tracking-wider">
                  HAMBURGUERIA ARTESANAL
                </p>
              </div>
            </div>

            {/* Banner amarelo diagonal */}
            <div className="relative mb-8">
              <div className="inline-block transform -rotate-2 bg-gradient-to-r from-yellow-400 to-amber-400 px-8 py-4 shadow-xl">
                <p className="text-2xl md:text-3xl font-bold text-amber-900 tracking-wide">
                  SABOR AUTÊNTICO
                </p>
              </div>
            </div>

            {/* Ícones de menu */}
            <div className="flex justify-center lg:justify-start items-center gap-6 md:gap-8 flex-wrap">
              {/* Churrasco */}
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-800 to-red-800 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <p className="text-sm font-bold text-amber-200 mt-2">CHURRASCO</p>
              </div>

              {/* Milkshakes */}
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-800 to-red-800 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <p className="text-sm font-bold text-amber-200 mt-2">MILKSHAKES</p>
              </div>

              {/* Fritas */}
              <div className="flex flex-col items-center group">
                <div className="w-16 h-16 bg-gradient-to-br from-amber-800 to-red-800 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <p className="text-sm font-bold text-amber-200 mt-2">FRITAS CROCRANTES</p>
              </div>
            </div>
          </div>

          {/* Lado direito - Hambúrguer central */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Hambúrguer principal */}
              <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                {/* Pão de cima */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-64 h-16 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-t-full shadow-lg border-4 border-amber-600">
                  <div className="absolute inset-2 bg-gradient-to-b from-yellow-200 to-yellow-300 rounded-t-full"></div>
                  {/* Sementes de gergelim */}
                  <div className="absolute top-2 left-4 w-2 h-2 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-3 right-6 w-1.5 h-1.5 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-1 left-1/2 w-1 h-1 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-4 right-8 w-1.5 h-1.5 bg-amber-700 rounded-full"></div>
                  <div className="absolute top-2 right-2 w-1 h-1 bg-amber-700 rounded-full"></div>
                </div>

                {/* Alface */}
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-60 h-8 bg-gradient-to-b from-green-400 to-green-500 rounded-full shadow-md">
                  <div className="absolute inset-1 bg-gradient-to-b from-green-300 to-green-400 rounded-full"></div>
                  {/* Textura da alface */}
                  <div className="absolute top-1 left-2 w-8 h-6 bg-green-300 rounded-full opacity-60"></div>
                  <div className="absolute top-1 right-4 w-6 h-5 bg-green-300 rounded-full opacity-60"></div>
                  <div className="absolute top-2 left-1/2 w-4 h-4 bg-green-300 rounded-full opacity-60"></div>
                </div>

                {/* Tomate */}
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-56 h-6 bg-gradient-to-b from-red-400 to-red-500 rounded-full shadow-md">
                  <div className="absolute inset-1 bg-gradient-to-b from-red-300 to-red-400 rounded-full"></div>
                  {/* Sementes do tomate */}
                  <div className="absolute top-1 left-4 w-1 h-1 bg-yellow-200 rounded-full"></div>
                  <div className="absolute top-1 right-6 w-1 h-1 bg-yellow-200 rounded-full"></div>
                  <div className="absolute top-2 left-1/2 w-1 h-1 bg-yellow-200 rounded-full"></div>
                </div>

                {/* Cebola */}
                <div className="absolute top-26 left-1/2 transform -translate-x-1/2 w-52 h-4 bg-gradient-to-b from-purple-200 to-purple-300 rounded-full shadow-md">
                  <div className="absolute inset-1 bg-gradient-to-b from-purple-100 to-purple-200 rounded-full"></div>
                </div>

                {/* Bacon */}
                <div className="absolute top-30 left-1/2 transform -translate-x-1/2 w-48 h-3 bg-gradient-to-b from-red-600 to-red-700 rounded-full shadow-md">
                  <div className="absolute inset-1 bg-gradient-to-b from-red-500 to-red-600 rounded-full"></div>
                  {/* Listras do bacon */}
                  <div className="absolute top-0 left-2 w-1 h-full bg-red-400"></div>
                  <div className="absolute top-0 right-4 w-1 h-full bg-red-400"></div>
                </div>

                {/* Queijo */}
                <div className="absolute top-33 left-1/2 transform -translate-x-1/2 w-44 h-5 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-full shadow-md">
                  <div className="absolute inset-1 bg-gradient-to-b from-yellow-200 to-yellow-300 rounded-full"></div>
                  {/* Textura do queijo derretido */}
                  <div className="absolute top-0 left-1 w-2 h-2 bg-yellow-200 rounded-full"></div>
                  <div className="absolute top-0 right-2 w-1.5 h-1.5 bg-yellow-200 rounded-full"></div>
                </div>

                {/* Carne */}
                <div className="absolute top-38 left-1/2 transform -translate-x-1/2 w-40 h-8 bg-gradient-to-b from-amber-700 to-amber-800 rounded-full shadow-lg">
                  <div className="absolute inset-1 bg-gradient-to-b from-amber-600 to-amber-700 rounded-full"></div>
                  {/* Grelhado da carne */}
                  <div className="absolute top-1 left-2 w-6 h-1 bg-amber-500 rounded-full"></div>
                  <div className="absolute top-3 right-3 w-4 h-1 bg-amber-500 rounded-full"></div>
                  <div className="absolute top-5 left-4 w-5 h-1 bg-amber-500 rounded-full"></div>
                </div>

                {/* Pão de baixo */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-64 h-16 bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-b-full shadow-lg border-4 border-amber-600">
                  <div className="absolute inset-2 bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-b-full"></div>
                </div>

                {/* Efeito de brilho */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-y-1"></div>
              </div>

              {/* Efeitos decorativos ao redor do hambúrguer */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400 rounded-full animate-bounce opacity-80"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-amber-400 rounded-full animate-pulse opacity-80"></div>
              <div className="absolute top-1/2 -left-8 w-4 h-4 bg-red-400 rounded-full animate-bounce opacity-60" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-1/4 -right-8 w-5 h-5 bg-yellow-300 rounded-full animate-pulse opacity-60" style={{animationDelay: '1s'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Efeito de brilho geral */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-y-1"></div>
    </div>
  );
}
