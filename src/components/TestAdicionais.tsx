import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Settings } from 'lucide-react';

export default function TestAdicionais() {
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [bulkAdicionais, setBulkAdicionais] = useState("");
  const [adicionalFormData, setAdicionalFormData] = useState({
    nome: "",
    preco_extra: 0,
    multi_selecao: false,
    obrigatorio: false,
    item_id: ""
  });

  const handleBulkAdd = () => {
    console.log('Adicionando em massa:', bulkAdicionais);
    alert(`Adicionando ${bulkAdicionais.split('\n').filter(line => line.trim()).length} adicionais`);
  };

  const handleSaveAdicional = () => {
    console.log('Salvando adicional:', adicionalFormData);
    alert(`Salvando adicional: ${adicionalFormData.nome}`);
  };

  const resetAdicionalForm = () => {
    setAdicionalFormData({
      nome: "",
      preco_extra: 0,
      multi_selecao: false,
      obrigatorio: false,
      item_id: ""
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste dos Botões de Adicionais</h1>
      
      <div className="space-y-4">
        {/* Ações básicas */}
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={() => {
              console.log('Clicou em Adicionar em Massa, showBulkAdd:', showBulkAdd);
              setShowBulkAdd(!showBulkAdd);
            }} 
            variant="outline" 
            className="border-purple-200 text-purple-600 hover:bg-purple-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar em Massa
          </Button>
          
          <Button 
            onClick={() => {
              console.log('Clicou em Novo Adicional');
              resetAdicionalForm();
              setShowBulkAdd(false);
            }} 
            variant="outline" 
            className="border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Adicional
          </Button>

          <Button 
            onClick={() => {
              console.log('Clicou em Carregar Padrão');
              alert('Carregando adicionais padrão...');
            }} 
            variant="outline" 
            className="border-orange-200 text-orange-600 hover:bg-orange-50"
          >
            <Settings className="h-4 w-4 mr-2" />
            Carregar Padrão
          </Button>
        </div>

        {/* Seção de Adicionar em Massa */}
        {showBulkAdd && (
          <div className="space-y-4 p-4 border rounded-lg bg-purple-50">
            <h3 className="font-semibold text-purple-800">Adicionar em Massa</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium">Formato: Nome do Adicional | Preço</Label>
                <Textarea
                  value={bulkAdicionais}
                  onChange={(e) => setBulkAdicionais(e.target.value)}
                  placeholder="Exemplo:&#10;Bacon adicional | 6.00&#10;Queijo adicional | 4.00&#10;Tomate adicional | 2.00"
                  rows={6}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleBulkAdd}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={!bulkAdicionais.trim()}
                >
                  Adicionar {bulkAdicionais.split('\n').filter(line => line.trim()).length} Adicionais
                </Button>
                <Button 
                  onClick={() => {
                    setShowBulkAdd(false);
                    setBulkAdicionais("");
                  }}
                  variant="outline"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Formulário de Novo/Editar Adicional */}
        {!showBulkAdd && (
          <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
            <h3 className="font-semibold text-blue-800">Novo Adicional</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Nome do Adicional</Label>
                <Input
                  value={adicionalFormData.nome}
                  onChange={(e) => setAdicionalFormData({...adicionalFormData, nome: e.target.value})}
                  placeholder="Ex: Bacon adicional"
                />
              </div>
              
              <div>
                <Label>Preço Extra (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={adicionalFormData.preco_extra}
                  onChange={(e) => setAdicionalFormData({...adicionalFormData, preco_extra: parseFloat(e.target.value) || 0})}
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={resetAdicionalForm}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveAdicional}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!adicionalFormData.nome.trim()}
              >
                Criar Adicional
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
