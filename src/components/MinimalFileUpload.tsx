import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface MinimalFileUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  maxSize?: number;
  className?: string;
}

export default function MinimalFileUpload({
  label,
  value,
  onChange,
  maxSize = 5,
  className = ""
}: MinimalFileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('=== DEBUG UPLOAD ===');
    console.log('Arquivo:', file.name);
    console.log('Tamanho:', file.size, 'bytes');
    console.log('Tipo:', file.type);

    // Validação básica
    if (!file.type.startsWith('image/')) {
      console.log('ERRO: Não é uma imagem');
      toast({
        title: "Erro",
        description: "Selecione apenas arquivos de imagem (PNG, JPG, GIF)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      console.log('ERRO: Arquivo muito grande');
      toast({
        title: "Erro",
        description: `Arquivo deve ter no máximo ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Iniciando conversão para base64...');
      
      // Criar preview
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      console.log('Preview criado:', url);

      // Converter para base64
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const result = e.target?.result;
        if (typeof result === 'string') {
          console.log('Base64 gerado com sucesso, tamanho:', result.length);
          onChange(result);
          toast({
            title: "Sucesso",
            description: "Imagem carregada com sucesso!",
          });
        } else {
          console.log('ERRO: Resultado não é string');
          toast({
            title: "Erro",
            description: "Erro ao processar arquivo",
            variant: "destructive",
          });
        }
      };
      
      reader.onerror = function(error) {
        console.log('ERRO no FileReader:', error);
        toast({
          title: "Erro",
          description: "Erro ao ler arquivo",
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(file);
      console.log('FileReader iniciado');

    } catch (error) {
      console.log('ERRO geral:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado",
        variant: "destructive",
      });
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange('');
    // Reset do input
    const input = document.getElementById(`file-input-${label}`) as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        {previewUrl ? (
          <div className="text-center space-y-4">
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-h-32 max-w-full object-contain rounded border mx-auto"
            />
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById(`file-input-${label}`)?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Alterar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Remover
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById(`file-input-${label}`)?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Imagem
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                PNG, JPG, GIF até {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        id={`file-input-${label}`}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
