import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";

interface SimpleFileUploadProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  accept?: string;
  maxSize?: number; // em MB
  preview?: boolean;
  className?: string;
}

export default function SimpleFileUpload({
  label,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5,
  preview = true,
  className = ""
}: SimpleFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

    setUploading(true);

    try {
      // Criar preview local
      const localPreview = URL.createObjectURL(file);
      setPreviewUrl(localPreview);

      // Converter para base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        onChange(base64);
        
        toast({
          title: "Sucesso",
          description: "Imagem carregada com sucesso",
        });
      };
      
      reader.onerror = () => {
        throw new Error('Erro ao processar arquivo');
      };
      
      reader.readAsDataURL(file);

    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar imagem. Tente novamente.",
        variant: "destructive",
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
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
              />
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                  <Loader2 className="h-6 w-6 text-white animate-spin" />
                </div>
              )}
            </div>
            
            <div className="flex gap-2 justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Processando...' : 'Alterar'}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={uploading}
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
                disabled={uploading}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? 'Processando...' : 'Selecionar Imagem'}
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
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
