import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SenhaTemporariaModalProps {
  isOpen: boolean;
  onClose: () => void;
  funcionarioNome: string;
  funcionarioEmail: string;
  senhaTemporaria: string;
}

export function SenhaTemporariaModal({
  isOpen,
  onClose,
  funcionarioNome,
  funcionarioEmail,
  senhaTemporaria,
}: SenhaTemporariaModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copiado!",
        description: "Senha copiada para a área de transferência",
      });
    } catch (err) {
      console.error('Erro ao copiar:', err);
      toast({
        title: "Erro",
        description: "Não foi possível copiar a senha",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Usuário Criado com Sucesso!</DialogTitle>
          <DialogDescription>
            O funcionário <strong>{funcionarioNome}</strong> foi cadastrado e um usuário de login foi criado.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Email de Login:</Label>
            <div className="flex items-center space-x-2">
              <Input
                value={funcionarioEmail}
                readOnly
                className="font-mono"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(funcionarioEmail)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Senha Temporária:</Label>
            <div className="flex items-center space-x-2">
              <Input
                type={showPassword ? "text" : "password"}
                value={senhaTemporaria}
                readOnly
                className="font-mono"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(senhaTemporaria)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> O funcionário deve alterar esta senha no primeiro login.
              Anote estas informações em local seguro.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button onClick={onClose} variant="outline">
              Fechar
            </Button>
            <Button 
              onClick={() => copyToClipboard(`${funcionarioEmail}\n${senhaTemporaria}`)}
              className="bg-primary"
            >
              Copiar Tudo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
