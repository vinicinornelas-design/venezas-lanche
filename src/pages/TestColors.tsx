import React from 'react';

export default function TestColors() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-amber-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center bg-gradient-to-r from-amber-600 to-red-600 bg-clip-text text-transparent">
          Teste de Cores Venezianas
        </h1>
        
        {/* Teste de Cores Primárias */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-amber-900">Cores Primárias</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-amber-500 to-red-500 p-6 rounded-lg text-white text-center">
              <p className="font-bold">Âmbar para Vermelho</p>
              <p className="text-sm">from-amber-500 to-red-500</p>
            </div>
            <div className="bg-gradient-to-r from-amber-600 to-red-600 p-6 rounded-lg text-white text-center">
              <p className="font-bold">Âmbar para Vermelho (Escuro)</p>
              <p className="text-sm">from-amber-600 to-red-600</p>
            </div>
            <div className="bg-gradient-to-r from-amber-400 to-yellow-400 p-6 rounded-lg text-amber-900 text-center">
              <p className="font-bold">Âmbar para Amarelo</p>
              <p className="text-sm">from-amber-400 to-yellow-400</p>
            </div>
          </div>
        </div>

        {/* Teste de Textos */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-amber-900">Textos</h2>
          <div className="space-y-2">
            <p className="text-amber-900 text-xl font-bold">Texto Principal (text-amber-900)</p>
            <p className="text-amber-800 text-lg font-semibold">Texto Secundário (text-amber-800)</p>
            <p className="text-amber-700 text-base">Texto Muted (text-amber-700)</p>
            <p className="text-amber-600 text-sm">Texto Claro (text-amber-600)</p>
          </div>
        </div>

        {/* Teste de Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-amber-900">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white/90 border border-amber-200 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-amber-900 mb-2">Card Simples</h3>
              <p className="text-amber-700">Este é um card com bordas âmbar e fundo branco.</p>
            </div>
            <div className="bg-gradient-to-r from-amber-100 to-red-100 border border-amber-300 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-amber-900 mb-2">Card com Gradiente</h3>
              <p className="text-amber-700">Este é um card com gradiente âmbar para vermelho.</p>
            </div>
          </div>
        </div>

        {/* Teste de Botões */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-amber-900">Botões</h2>
          <div className="flex flex-wrap gap-4">
            <button className="bg-gradient-to-r from-amber-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300">
              Botão Primário
            </button>
            <button className="border-2 border-amber-400 text-amber-600 hover:bg-amber-50 px-6 py-3 rounded-lg font-bold transition-all duration-300">
              Botão Secundário
            </button>
            <button className="bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 px-6 py-3 rounded-lg font-bold transition-all duration-300">
              Botão Acento
            </button>
          </div>
        </div>

        {/* Teste de Badges */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-amber-900">Badges</h2>
          <div className="flex flex-wrap gap-4">
            <span className="bg-gradient-to-r from-amber-100 to-red-100 text-amber-800 border border-amber-300 px-4 py-2 rounded-full font-semibold">
              Badge Simples
            </span>
            <span className="bg-gradient-to-r from-yellow-400 to-amber-400 text-amber-900 px-4 py-2 rounded-full font-bold">
              Badge Destaque
            </span>
            <span className="bg-gradient-to-r from-amber-500 to-red-500 text-white px-4 py-2 rounded-full font-bold">
              Badge Primário
            </span>
          </div>
        </div>

        {/* Status */}
        <div className="bg-gradient-to-r from-amber-100 to-red-100 border border-amber-300 rounded-lg p-6 text-center">
          <h3 className="text-xl font-bold text-amber-900 mb-2">Status do Teste</h3>
          <p className="text-amber-700">
            Se você está vendo estas cores âmbar e vermelho, as cores venezianas estão funcionando corretamente!
          </p>
        </div>
      </div>
    </div>
  );
}
