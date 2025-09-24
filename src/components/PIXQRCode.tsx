import React, { useEffect, useRef, useState } from 'react';
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
  onPaymentConfirmed?: () => void;
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

  // Função para gerar o código PIX
  const generatePixCode = (pixData: PIXData): string => {
    const pixPayload = {
      pixKey: pixData.chave,
      description: pixData.descricao,
      merchantName: pixData.beneficiario,
      merchantCity: pixData.cidade,
      amount: pixData.valor,
      txid: pixData.identificador
    };

    // Gerar código PIX no formato EMV
    const emvCode = `00020126${pixPayload.pixKey.length.toString().padStart(2, '0')}${pixPayload.pixKey}52040000530398654${pixPayload.amount.toFixed(2)}5802BR59${pixPayload.merchantName.length.toString().padStart(2, '0')}${pixPayload.merchantName}60${pixPayload.merchantCity.length.toString().padStart(2, '0')}${pixPayload.merchantCity}62070503***6304`;

    return emvCode;
  };

  // Função para gerar QR Code usando API externa
  const generateQRCode = async (pixCode: string) => {
    try {
      setIsGenerating(true);
      
      // Usar API externa para gerar QR Code
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixCode)}`;
      setQrCodeDataURL(qrCodeUrl);
      
      // Desenhar no canvas
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = qrCodeUrl;
        }
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
        title: "Chave PIX obrigatória",
        description: "Por favor, informe a chave PIX para gerar o QR Code.",
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

    const newPixCode = generatePixCode(pixData);
    setPixCode(newPixCode);
    generateQRCode(newPixCode);
  };

  // Função para copiar código PIX
  const handleCopyPixCode = async () => {
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
  const handleDownloadQRCode = async () => {
    if (!qrCodeDataURL) return;

    try {
      const response = await fetch(qrCodeDataURL);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.download = `pix-qr-${valor}-${Date.now()}.png`;
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);

      toast({
        title: "QR Code baixado",
        description: "O QR Code foi baixado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao baixar QR Code:', error);
      toast({
        title: "Erro",
        description: "Erro ao baixar QR Code. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Gerar QR Code inicial quando o componente monta
  useEffect(() => {
    if (chavePix && valor > 0) {
      handleGenerateQRCode();
    }
  }, [valor, chavePix]);

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Pagamento via PIX
          </CardTitle>
          <CardDescription>
            Escaneie o QR Code com seu aplicativo de pagamento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Valor do pagamento */}
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 mb-1">Valor a pagar</p>
            <p className="text-2xl font-bold text-green-800">
              R$ {valor.toFixed(2).replace('.', ',')}
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={300}
                height={300}
                className="border rounded-lg bg-white"
              />
              {isGenerating && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 rounded-lg">
                  <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
            </div>
          </div>

          {/* Informações do pagamento */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Beneficiário:</span>
              <span className="font-medium">{customBeneficiario}</span>
            </div>
            <div className="flex justify-between">
              <span>Chave PIX:</span>
              <span className="font-medium text-xs break-all">{customChavePix}</span>
            </div>
            <div className="flex justify-between">
              <span>Descrição:</span>
              <span className="font-medium">{customDescricao}</span>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex gap-2">
            <Button
              onClick={handleCopyPixCode}
              variant="outline"
              className="flex-1"
              disabled={!pixCode}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
              ) : (
                <Copy className="h-4 w-4 mr-2" />
              )}
              {copied ? 'Copiado!' : 'Copiar Código'}
            </Button>
            
            <Button
              onClick={handleDownloadQRCode}
              variant="outline"
              className="flex-1"
              disabled={!qrCodeDataURL}
            >
              <Download className="h-4 w-4 mr-2" />
              Baixar QR
            </Button>
          </div>

          {/* Botão para configurar PIX */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Configurar PIX
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Configurar Pagamento PIX</DialogTitle>
                <DialogDescription>
                  Configure os dados para geração do QR Code PIX
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="chave-pix">Chave PIX *</Label>
                  <Input
                    id="chave-pix"
                    placeholder="Ex: 11999999999 ou email@exemplo.com"
                    value={customChavePix}
                    onChange={(e) => setCustomChavePix(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="beneficiario">Nome do Beneficiário</Label>
                  <Input
                    id="beneficiario"
                    placeholder="Nome da empresa"
                    value={customBeneficiario}
                    onChange={(e) => setCustomBeneficiario(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    placeholder="Descrição do pagamento"
                    value={customDescricao}
                    onChange={(e) => setCustomDescricao(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Valor</Label>
                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                    <span className="text-lg font-semibold">
                      R$ {valor.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setIsDialogOpen(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    handleGenerateQRCode();
                    setIsDialogOpen(false);
                  }}
                  className="flex-1"
                  disabled={!customChavePix}
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Gerar QR Code
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Instruções */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <div className="flex items-start gap-2">
              <Smartphone className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Como pagar:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Abra o app do seu banco</li>
                  <li>Escaneie o QR Code ou cole o código PIX</li>
                  <li>Confirme o pagamento</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Botão de confirmação de pagamento */}
          {onPaymentConfirmed && (
            <Button
              onClick={onPaymentConfirmed}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Pagamento
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
