import { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from './use-toast';

interface MenuItem {
  id: string;
  nome: string;
  preco: number;
  descricao: string;
  categoria: string;
  ativo: boolean;
  imagem_url?: string;
}

interface RestaurantConfig {
  nome_restaurante: string;
  telefone: string;
  endereco: string;
  logo_url?: string;
}

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const exportMenuToPdf = async (
    menuItems: MenuItem[],
    restaurantConfig: RestaurantConfig
  ) => {
    setIsExporting(true);
    
    try {
      // Criar elemento temporário para renderizar o cardápio
      const tempElement = document.createElement('div');
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.top = '0';
      tempElement.style.width = '800px';
      tempElement.style.backgroundColor = 'white';
      tempElement.style.padding = '40px';
      tempElement.style.fontFamily = 'Arial, sans-serif';
      
      // Organizar itens por categoria
      const itemsByCategory = menuItems.reduce((acc, item) => {
        if (!acc[item.categoria]) {
          acc[item.categoria] = [];
        }
        acc[item.categoria].push(item);
        return acc;
      }, {} as Record<string, MenuItem[]>);

      // Gerar HTML do cardápio
      tempElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px;">
          ${restaurantConfig.logo_url ? 
            `<img src="${restaurantConfig.logo_url}" style="max-height: 80px; margin-bottom: 20px;" />` : 
            ''
          }
          <h1 style="color: #e67e22; font-size: 32px; margin: 0; font-weight: bold;">
            ${restaurantConfig.nome_restaurante}
          </h1>
          <p style="color: #666; font-size: 16px; margin: 10px 0;">
            ${restaurantConfig.telefone} • ${restaurantConfig.endereco}
          </p>
          <hr style="border: 2px solid #e67e22; margin: 20px 0;" />
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #333; font-size: 24px; margin: 0;">CARDÁPIO</h2>
        </div>
        
        ${Object.entries(itemsByCategory).map(([category, items]) => `
          <div style="margin-bottom: 40px;">
            <h3 style="color: #e67e22; font-size: 20px; margin-bottom: 20px; text-transform: uppercase; border-bottom: 2px solid #e67e22; padding-bottom: 10px;">
              ${category}
            </h3>
            <div style="display: grid; gap: 20px;">
              ${items.map(item => `
                <div style="display: flex; align-items: center; padding: 15px; border: 1px solid #eee; border-radius: 8px; background: #fafafa;">
                  ${item.imagem_url ? 
                    `<img src="${item.imagem_url}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px; margin-right: 20px;" />` : 
                    `<div style="width: 80px; height: 80px; background: #ddd; border-radius: 8px; margin-right: 20px; display: flex; align-items: center; justify-content: center; color: #999;">Sem foto</div>`
                  }
                  <div style="flex: 1;">
                    <h4 style="color: #333; font-size: 18px; margin: 0 0 8px 0; font-weight: bold;">
                      ${item.nome}
                    </h4>
                    <p style="color: #666; font-size: 14px; margin: 0 0 8px 0; line-height: 1.4;">
                      ${item.descricao}
                    </p>
                  </div>
                  <div style="text-align: right;">
                    <span style="color: #e67e22; font-size: 20px; font-weight: bold;">
                      R$ ${item.preco.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #e67e22;">
          <p style="color: #666; font-size: 14px; margin: 0;">
            Obrigado pela preferência! • ${new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>
      `;

      document.body.appendChild(tempElement);

      // Gerar canvas do HTML
      const canvas = await html2canvas(tempElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remover elemento temporário
      document.body.removeChild(tempElement);

      // Criar PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Adicionar primeira página
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Adicionar páginas adicionais se necessário
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Salvar PDF
      const fileName = `cardapio-${restaurantConfig.nome_restaurante.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);

      toast({
        title: "Sucesso!",
        description: "Cardápio exportado como PDF com sucesso!",
      });

    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar cardápio como PDF. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportMenuToPdf,
    isExporting
  };
}
