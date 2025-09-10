import { useState, useEffect } from "react";

export default function PainelColaborador() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('PainelColaborador mounted');
    
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Painel do Colaborador</h1>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Painel do Colaborador</h1>
      <p className="mb-4">Página funcionando corretamente!</p>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-medium text-green-800">Status</h3>
        <p className="text-green-600">Componente carregado com sucesso</p>
      </div>
    </div>
  );
}