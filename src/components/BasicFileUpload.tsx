import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon } from "lucide-react";

interface BasicFileUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  maxSize?: number;
  className?: string;
}

export default function BasicFileUpload({
  label,
  value,
  onChange,
  maxSize = 5,
  className = ""
}: BasicFileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('Arquivo selecionado:', file.name, file.size, file.type);

    // Validação do tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione apenas arquivos de imagem",
        variant: "destructive",
      });
      return;
    }

    // Validação do tamanho
    if (file.size > maxSize * 1024 * 1024) {
      toast({
        title: "Erro",
        description: `O arquivo deve ter no máximo ${maxSize}MB`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Criar preview local
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Converter para base64
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        console.log('Base64 gerado:', base64.substring(0, 50) + '...');
        onChange(base64);
        
        toast({
          title: "Sucesso",
          description: "Imagem carregada com sucesso",
        });
      };
      
      reader.onerror = (error) => {
        console.error('Erro no FileReader:', error);
        toast({
          title: "Erro",
          description: "Erro ao processar arquivo",
          variant: "destructive",
        });
      };
      
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Erro geral:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao processar imagem",
        variant: "destructive",
      });
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      
      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
        {previewUrl ? (
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-h-32 max-w-full object-contain rounded border"
                onError={(e) => {
                  console.error('Erro ao carregar preview:', e);
                  setPreviewUrl(null);
                }}
              />
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
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
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <Button
                type="button"
                variant="outline"
                onClick={handleClick}
              >
                <Upload className="h-4 w-4 mr-2" />
                Selecionar Imagem
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                PNG, JPG, GIF até {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
