import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function TestUpload() {
  const [image, setImage] = useState<string>("");
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("=== TESTE UPLOAD ===");
    console.log("Evento disparado");
    
    const file = e.target.files?.[0];
    console.log("Arquivo:", file);
    
    if (!file) {
      console.log("Nenhum arquivo selecionado");
      return;
    }

    console.log("Nome:", file.name);
    console.log("Tamanho:", file.size);
    console.log("Tipo:", file.type);

    if (!file.type.startsWith('image/')) {
      console.log("ERRO: Não é imagem");
      toast({
        title: "Erro",
        description: "Selecione uma imagem",
        variant: "destructive",
      });
      return;
    }

    console.log("Iniciando FileReader...");
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      console.log("FileReader onload disparado");
      const result = event.target?.result;
      console.log("Resultado:", typeof result, result ? result.substring(0, 50) + "..." : "null");
      
      if (typeof result === 'string') {
        setImage(result);
        toast({
          title: "Sucesso",
          description: "Imagem carregada!",
        });
        console.log("Imagem definida com sucesso");
      }
    };
    
    reader.onerror = (error) => {
      console.log("ERRO no FileReader:", error);
      toast({
        title: "Erro",
        description: "Erro ao ler arquivo",
        variant: "destructive",
      });
    };
    
    reader.readAsDataURL(file);
    console.log("FileReader.readAsDataURL chamado");
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-4">Teste de Upload</h3>
      
      <div className="space-y-4">
        <div>
          <Label>Selecionar Imagem</Label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-2"
          />
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
