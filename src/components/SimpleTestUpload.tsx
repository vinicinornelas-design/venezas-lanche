import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SimpleTestUpload() {
  const [image, setImage] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("=== SIMPLE TEST UPLOAD ===");
    console.log("Evento disparado");
    
    const file = e.target.files?.[0];
    console.log("Arquivo:", file);
    
    if (!file) {
      console.log("Nenhum arquivo selecionado");
      setMessage("Nenhum arquivo selecionado");
      return;
    }

    console.log("Nome:", file.name);
    console.log("Tamanho:", file.size);
    console.log("Tipo:", file.type);

    if (!file.type.startsWith('image/')) {
      console.log("ERRO: Não é imagem");
      setMessage("ERRO: Selecione uma imagem");
      return;
    }

    console.log("Iniciando FileReader...");
    setMessage("Processando arquivo...");
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      console.log("FileReader onload disparado");
      const result = event.target?.result;
      console.log("Resultado:", typeof result, result ? result.substring(0, 50) + "..." : "null");
      
      if (typeof result === 'string') {
        setImage(result);
        setMessage("SUCESSO: Imagem carregada!");
        console.log("Imagem definida com sucesso");
      } else {
        setMessage("ERRO: Resultado inválido");
      }
    };
    
    reader.onerror = (error) => {
      console.log("ERRO no FileReader:", error);
      setMessage("ERRO: Erro ao ler arquivo");
    };
    
    reader.readAsDataURL(file);
    console.log("FileReader.readAsDataURL chamado");
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Teste Simples de Upload</h3>
      
      <div className="space-y-4">
        <div>
          <Label>Selecionar Imagem</Label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>
        
        <div className="p-2 bg-gray-100 rounded">
          <strong>Status:</strong> {message}
        </div>
        
        {image && (
          <div>
            <Label>Preview:</Label>
            <img 
              src={image} 
              alt="Preview" 
              className="max-h-32 border rounded mt-2"
            />
          </div>
        )}
        
        <div>
          <Label>Base64 (primeiros 100 chars):</Label>
          <p className="text-xs text-gray-500 mt-1 break-all">
            {image ? image.substring(0, 100) + "..." : "Nenhuma imagem"}
          </p>
        </div>
      </div>
    </div>
  );
}
