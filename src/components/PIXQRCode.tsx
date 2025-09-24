import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  QrCode, 
  Copy, 
  Download, 
  RefreshCw, 
  CheckCircle,
  Smartphone,
  CreditCard
} from 'lucide-react';

interface PIXQRCodeProps {
  valor: number;
  chavePix?: string;
  descricao?: string;
  beneficiario?: string;
  onPaymentConfirmed: () => void;
  className?: string;
}

interface PIXData {
  chave: string;
  valor: number;
  descricao: string;
  beneficiario: string;
  cidade: string;
  identificador: string;
}

export default function PIXQRCode({
  valor,
  chavePix = '',
  descricao = 'Pagamento via PIX',
  beneficiario = 'Veneza\'s Lanche',
  onPaymentConfirmed,
  className = ''
}: PIXQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>('');
  const [pixCode, setPixCode] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [customChavePix, setCustomChavePix] = useState(chavePix);
  const [customDescricao, setCustomDescricao] = useState(descricao);
  const [customBeneficiario, setCustomBeneficiario] = useState(beneficiario);
  const [copied, setCopied] = useState(false);
  const [pixConfig, setPixConfig] = useState<{chave_pix: string, nome_beneficiario_pix: string} | null>(null);
  const { toast } = useToast();

  // Buscar configurações PIX do banco
  useEffect(() => {
    const fetchPixConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('restaurant_config')
          .select('chave_pix, nome_beneficiario_pix')
          .single();

        if (error) throw error;

        if (data) {
          setPixConfig(data);
          if (data.chave_pix) {
            setCustomChavePix(data.chave_pix);
          }
          if (data.nome_beneficiario_pix) {
            setCustomBeneficiario(data.nome_beneficiario_pix);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar configurações PIX:', error);
      }
    };

    fetchPixConfig();
  }, []);

  // Função para gerar código PIX EMV
  const generatePixCode = (pixData: PIXData): string => {
    const pixPayload = {
      pixKey: pixData.chave,
      amount: pixData.valor,
      merchantName: pixData.beneficiario,
      merchantCity: pixData.cidade,
      description: pixData.descricao,
      txid: pixData.identificador
    };

    const emvCode = `00020126${pixPayload.pixKey.length.toString().padStart(2, '0')}${pixPayload.pixKey}52040000530398654${pixPayload.amount.toFixed(2)}5802BR59${pixPayload.merchantName.length.toString().padStart(2, '0')}${pixPayload.merchantName}60${pixPayload.merchantCity.length.toString().padStart(2, '0')}${pixPayload.merchantCity}62070503***6304`;

    return emvCode;
  };

  // Função para gerar QR Code
  const generateQRCode = async (pixCode: string) => {
    if (!canvasRef.current) return;

    try {
      setIsGenerating(true);
      
      const canvas = canvasRef.current;
      const qrCodeDataURL = await QRCode.toDataURL(pixCode, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      setQrCodeDataURL(qrCodeDataURL);
      
      // Desenhar no canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        };
        img.src = qrCodeDataURL;
      }
    } catch (error) {
      console.error('Erro ao gerar QR Code:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar QR Code. Verifique os dados e tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Função para gerar novo QR Code
  const handleGenerateQRCode = () => {
    if (!customChavePix) {
      toast({
        title: "Erro",
        description: "Chave PIX é obrigatória para gerar o QR Code.",
        variant: "destructive",
      });
      return;
    }

    const pixData: PIXData = {
      chave: customChavePix,
      valor: valor,
      descricao: customDescricao,
      beneficiario: customBeneficiario,
      cidade: 'São Paulo',
      identificador: `VEN${Date.now()}`
    };

    const emvCode = generatePixCode(pixData);
    setPixCode(emvCode);
    generateQRCode(emvCode);
  };

  // Função para copiar código PIX
  const handleCopyPixCode = async () => {
    if (!pixCode) return;

    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast({
        title: "Código PIX copiado",
        description: "O código PIX foi copiado para a área de transferência.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar código PIX:', error);
      toast({
        title: "Erro",
        description: "Erro ao copiar código PIX. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para baixar QR Code
  const handleDownloadQRCode = () => {
    if (!qrCodeDataURL) return;

    const link = document.createElement('a');
    link.download = `pix-qr-${valor}-${Date.now()}.png`;
    link.href = qrCodeDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "QR Code baixado",
      description: "O QR Code foi baixado com sucesso.",
    });
  };

  // Gerar QR Code inicial quando o componente monta
  useEffect(() => {
    if (chavePix && valor > 0) {
      handleGenerateQRCode();
    }
  }, [chavePix, valor]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Card principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Pagamento PIX
          </CardTitle>
          <CardDescription>
            Escaneie o QR Code ou copie o código PIX para realizar o pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações do pagamento */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Valor</Label>
              <p className="text-2xl font-bold text-green-600">
                R$ {valor.toFixed(2).replace('.', ',')}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Beneficiário</Label>
              <p className="text-sm text-gray-600">{customBeneficiario}</p>
            </div>
          </div>

          {/* QR Code */}
          <div className="text-center">
            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="border border-gray-300"
              />
            </div>
            {isGenerating && (
              <div className="mt-2 flex items-center justify-center gap-2 text-sm text-gray-500">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Gerando QR Code...
              </div>
            )}
          </div>

          {/* Código PIX */}
          {pixCode && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Código PIX</Label>
              <div className="flex gap-2">
                <Input
                  value={pixCode}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  onClick={handleCopyPixCode}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </div>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateQRCode}
              disabled={isGenerating || !customChavePix}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Gerar Novo QR Code
            </Button>
            
            {qrCodeDataURL && (
              <Button
                onClick={handleDownloadQRCode}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Baixar QR Code
              </Button>
            )}
          </div>

          {/* Instruções */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Como pagar:</h4>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Abra o app do seu banco</li>
              <li>2. Escaneie o QR Code ou cole o código PIX</li>
              <li>3. Confirme o pagamento</li>
              <li>4. Clique em "Confirmar Pagamento" abaixo</li>
            </ol>
          </div>

          {/* Botão de confirmação */}
          <Button
            onClick={onPaymentConfirmed}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            Confirmar Pagamento
          </Button>
        </CardContent>
      </Card>

      {/* Modal para configurações avançadas */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            <Settings className="h-4 w-4 mr-2" />
            Configurações PIX
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurações PIX</DialogTitle>
            <DialogDescription>
              Personalize as informações do pagamento PIX
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="chave-pix">Chave PIX</Label>
              <Input
                id="chave-pix"
                value={customChavePix}
                onChange={(e) => setCustomChavePix(e.target.value)}
                placeholder="Digite a chave PIX"
              />
            </div>
            <div>
              <Label htmlFor="descricao">Descrição</Label>
              <Input
                id="descricao"
                value={customDescricao}
                onChange={(e) => setCustomDescricao(e.target.value)}
                placeholder="Descrição do pagamento"
              />
            </div>
            <div>
              <Label htmlFor="beneficiario">Beneficiário</Label>
              <Input
                id="beneficiario"
                value={customBeneficiario}
                onChange={(e) => setCustomBeneficiario(e.target.value)}
                placeholder="Nome do beneficiário"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}