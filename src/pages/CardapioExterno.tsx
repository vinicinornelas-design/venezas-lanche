import React from "react";

const CARDAPIO_URL = "https://venezaslanches.meucardapio.ai/link/31971708941/3SI9xZYLNQ";

export default function CardapioExterno() {
  return (
    <div className="min-h-screen" style={{ backgroundImage: 'url(/assets/veneza-bg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/assets/veneza-logo.png" alt="Logo" className="w-8 h-8 object-contain rounded" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              <h1 className="text-xl font-bold text-foreground">Cardápio</h1>
            </div>
            <a
              href={CARDAPIO_URL}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-primary underline"
            >
              Abrir em nova aba
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-2 sm:p-4">
        <div className="rounded-lg overflow-hidden border shadow-sm" style={{ height: "calc(100vh - 96px)" }}>
          <iframe
            title="Cardápio Veneza's Lanches"
            src={CARDAPIO_URL}
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}


