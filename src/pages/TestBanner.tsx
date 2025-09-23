import React from 'react';
import VenezaBannerCustom from '@/components/VenezaBannerCustom';

export default function TestBanner() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-amber-100">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent mb-4">
            Teste do Banner Veneziano
          </h1>
          <p className="text-amber-700 text-lg">
            Banner customizado com hambúrguer e paleta de cores venezianas
          </p>
        </div>

        {/* Banner de teste */}
        <div className="mb-8">
          <VenezaBannerCustom className="h-96 md:h-[500px] rounded-2xl shadow-2xl" />
        </div>

        {/* Informações sobre o banner */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-amber-200">
          <h2 className="text-2xl font-bold text-amber-900 mb-4">Características do Banner</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">🎨 Paleta de Cores</h3>
              <ul className="text-amber-700 space-y-1">
                <li>• Âmbar (amber-900, amber-600, amber-400)</li>
                <li>• Vermelho (red-900, red-600, red-500)</li>
                <li>• Dourado (yellow-400, yellow-300)</li>
                <li>• Gradientes venezianos</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">🍔 Hambúrguer 3D</h3>
              <ul className="text-amber-700 space-y-1">
                <li>• Pão com sementes de gergelim</li>
                <li>• Alface fresca</li>
                <li>• Tomate com sementes</li>
                <li>• Cebola roxa</li>
                <li>• Bacon crocante</li>
                <li>• Queijo derretido</li>
                <li>• Carne grelhada</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">🏛️ Elementos Venezianos</h3>
              <ul className="text-amber-700 space-y-1">
                <li>• Círculos decorativos</li>
                <li>• Silhuetas de gondolas</li>
                <li>• Gradientes venezianos</li>
                <li>• Efeitos de brilho</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-amber-800 mb-2">✨ Animações</h3>
              <ul className="text-amber-700 space-y-1">
                <li>• Efeitos de hover</li>
                <li>• Animações de bounce</li>
                <li>• Transições suaves</li>
                <li>• Efeitos de brilho</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Botões de teste */}
        <div className="text-center mt-8 space-x-4">
          <button 
            onClick={() => window.location.href = '/menu-publico'}
            className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 transform hover:scale-105"
          >
            Ver no Cardápio
          </button>
          <button 
            onClick={() => window.location.href = '/test-colors'}
            className="border-2 border-amber-400 text-amber-600 hover:bg-amber-50 px-8 py-3 rounded-xl font-bold transition-all duration-300"
          >
            Testar Cores
          </button>
        </div>
      </div>
    </div>
  );
}
