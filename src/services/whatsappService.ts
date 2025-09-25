import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppConfig {
  id?: string;
  phone_number_id: string;
  access_token: string;
  webhook_verify_token: string;
  business_account_id: string;
  enabled: boolean;
  restaurant_id: string;
}

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  interactive?: {
    type: 'button' | 'list';
    body: {
      text: string;
    };
    action: {
      buttons?: Array<{
        type: 'reply';
        reply: {
          id: string;
          title: string;
        };
      }>;
      sections?: Array<{
        title: string;
        rows: Array<{
          id: string;
          title: string;
          description?: string;
        }>;
      }>;
    };
  };
}

export interface OrderNotification {
  orderId: string;
  customerName: string;
  customerPhone: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryMethod: string;
  paymentMethod: string;
  address?: string;
  notes?: string;
}

class WhatsAppService {
  private config: WhatsAppConfig | null = null;
  private baseUrl = 'https://graph.facebook.com/v18.0';

  async initializeConfig(restaurantId: string): Promise<void> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      this.config = data;
    } catch (error) {
      console.error('Error initializing WhatsApp config:', error);
      throw error;
    }
  }

  async saveConfig(config: WhatsAppConfig): Promise<void> {
    try {
      const { error } = await supabase
        .from('whatsapp_config')
        .upsert(config);

      if (error) throw error;

      this.config = config;
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      throw error;
    }
  }

  async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    if (!this.config?.enabled) {
      console.warn('WhatsApp integration is disabled');
      return false;
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.config.phone_number_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.config.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            ...message,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`WhatsApp API Error: ${JSON.stringify(errorData)}`);
      }

      return true;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      return false;
    }
  }

  async sendOrderNotification(order: OrderNotification): Promise<boolean> {
    const message = this.formatOrderMessage(order);
    return await this.sendMessage(message);
  }

  async sendOrderConfirmation(phone: string, orderId: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phone,
      type: 'text',
      text: {
        body: `🍔 *Pedido Confirmado!*\n\nSeu pedido #${orderId} foi recebido e está sendo preparado.\n\nVocê receberá atualizações sobre o status do seu pedido.\n\nObrigado por escolher Veneza's Lanches! 🍕`
      }
    };

    return await this.sendMessage(message);
  }

  async sendOrderStatusUpdate(phone: string, orderId: string, status: string): Promise<boolean> {
    const statusMessages = {
      'PREPARANDO': '🍳 Seu pedido está sendo preparado!',
      'PRONTO': '✅ Seu pedido está pronto para retirada/entrega!',
      'SAIU_PARA_ENTREGA': '🚚 Seu pedido saiu para entrega!',
      'ENTREGUE': '🎉 Pedido entregue! Obrigado pela preferência!',
      'CANCELADO': '❌ Seu pedido foi cancelado.'
    };

    const message: WhatsAppMessage = {
      to: phone,
      type: 'text',
      text: {
        body: `${statusMessages[status as keyof typeof statusMessages] || 'Status atualizado'}\n\nPedido #${orderId}\n\nVeneza's Lanches 🍔`
      }
    };

    return await this.sendMessage(message);
  }

  async sendMenuInteractive(phone: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: '🍔 *Bem-vindo ao Veneza's Lanches!*\n\nEscolha uma opção para continuar:'
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'menu',
                title: '📋 Ver Cardápio'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'pedido',
                title: '🛒 Fazer Pedido'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'status',
                title: '📊 Status Pedido'
              }
            }
          ]
        }
      }
    };

    return await this.sendMessage(message);
  }

  private formatOrderMessage(order: OrderNotification): WhatsAppMessage {
    const itemsText = order.items
      .map(item => `• ${item.name} x${item.quantity} - R$ ${item.price.toFixed(2)}`)
      .join('\n');

    const addressText = order.address ? `\n📍 *Endereço:* ${order.address}` : '';
    const notesText = order.notes ? `\n📝 *Observações:* ${order.notes}` : '';

    return {
      to: order.customerPhone,
      type: 'text',
      text: {
        body: `🆕 *NOVO PEDIDO RECEBIDO!*\n\n👤 *Cliente:* ${order.customerName}\n📱 *Telefone:* ${order.customerPhone}\n🆔 *Pedido:* #${order.orderId}\n\n📋 *Itens:*\n${itemsText}\n\n💰 *Total:* R$ ${order.total.toFixed(2)}\n🚚 *Entrega:* ${order.deliveryMethod}\n💳 *Pagamento:* ${order.paymentMethod}${addressText}${notesText}\n\n⏰ *Horário:* ${new Date().toLocaleString('pt-BR')}`
      }
    };
  }

  async verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null> {
    if (!this.config) return null;

    if (mode === 'subscribe' && token === this.config.webhook_verify_token) {
      return challenge;
    }

    return null;
  }

  async handleWebhook(body: any): Promise<void> {
    try {
      const entry = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value = changes?.value;

      if (value?.messages) {
        for (const message of value.messages) {
          await this.processIncomingMessage(message);
        }
      }
    } catch (error) {
      console.error('Error handling webhook:', error);
    }
  }

  private async processIncomingMessage(message: any): Promise<void> {
    const phone = message.from;
    const messageType = message.type;

    if (messageType === 'interactive') {
      const buttonId = message.interactive?.button_reply?.id;
      await this.handleButtonResponse(phone, buttonId);
    } else if (messageType === 'text') {
      const text = message.text?.body;
      await this.handleTextMessage(phone, text);
    }
  }

  private async handleButtonResponse(phone: string, buttonId: string): Promise<void> {
    switch (buttonId) {
      case 'menu':
        await this.sendMenuList(phone);
        break;
      case 'pedido':
        await this.sendOrderInstructions(phone);
        break;
      case 'status':
        await this.sendStatusInstructions(phone);
        break;
    }
  }

  private async handleTextMessage(phone: string, text: string): Promise<void> {
    // Implementar lógica para processar mensagens de texto
    // Por exemplo, buscar status de pedido por número
    if (text.match(/^#\d+$/)) {
      await this.sendOrderStatusByNumber(phone, text);
    }
  }

  private async sendMenuList(phone: string): Promise<boolean> {
    // Implementar envio de cardápio via lista interativa
    const message: WhatsAppMessage = {
      to: phone,
      type: 'text',
      text: {
        body: '🍔 *CARDÁPIO VENEZA\'S LANCHES*\n\n📱 Para fazer seu pedido, acesse nosso site:\nhttps://venezas-lanche.vercel.app\n\nOu ligue para: (11) 99999-9999\n\n🕒 *Horário de funcionamento:*\nSegunda a Domingo: 18h às 23h\n\nObrigado pela preferência! 🍕'
      }
    };

    return await this.sendMessage(message);
  }

  private async sendOrderInstructions(phone: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phone,
      type: 'text',
      text: {
        body: '🛒 *COMO FAZER SEU PEDIDO*\n\n1️⃣ Acesse nosso site: https://venezas-lanche.vercel.app\n2️⃣ Escolha seus itens do cardápio\n3️⃣ Finalize seu pedido\n4️⃣ Aguarde a confirmação via WhatsApp\n\n📞 *Dúvidas?* Ligue: (11) 99999-9999\n\n🍔 Veneza\'s Lanches - O melhor da região!'
      }
    };

    return await this.sendMessage(message);
  }

  private async sendStatusInstructions(phone: string): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phone,
      type: 'text',
      text: {
        body: '📊 *CONSULTAR STATUS DO PEDIDO*\n\nDigite o número do seu pedido no formato:\n#123\n\nExemplo: #456\n\n📞 *Precisa de ajuda?*\nLigue: (11) 99999-9999\n\n🍔 Veneza\'s Lanches'
      }
    };

    return await this.sendMessage(message);
  }

  private async sendOrderStatusByNumber(phone: string, orderNumber: string): Promise<void> {
    try {
      const orderId = orderNumber.replace('#', '');
      
      const { data: order, error } = await supabase
        .from('pedidos_unificados')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error || !order) {
        await this.sendMessage({
          to: phone,
          type: 'text',
          text: {
            body: '❌ *Pedido não encontrado*\n\nVerifique o número do pedido e tente novamente.\n\n📞 *Dúvidas?* Ligue: (11) 99999-9999'
          }
        });
        return;
      }

      const statusMessages = {
        'PENDENTE': '⏳ Seu pedido está pendente de confirmação',
        'CONFIRMADO': '✅ Seu pedido foi confirmado e está sendo preparado',
        'PREPARANDO': '🍳 Seu pedido está sendo preparado',
        'PRONTO': '🎉 Seu pedido está pronto!',
        'SAIU_PARA_ENTREGA': '🚚 Seu pedido saiu para entrega',
        'ENTREGUE': '✅ Pedido entregue com sucesso!',
        'CANCELADO': '❌ Seu pedido foi cancelado'
      };

      const statusText = statusMessages[order.status as keyof typeof statusMessages] || 'Status desconhecido';

      await this.sendMessage({
        to: phone,
        type: 'text',
        text: {
          body: `📊 *STATUS DO PEDIDO #${orderId}*\n\n${statusText}\n\n💰 *Total:* R$ ${order.total?.toFixed(2) || '0,00'}\n📅 *Data:* ${new Date(order.created_at).toLocaleString('pt-BR')}\n\n🍔 Veneza's Lanches`
        }
      });

    } catch (error) {
      console.error('Error fetching order status:', error);
      await this.sendMessage({
        to: phone,
        type: 'text',
        text: {
          body: '❌ *Erro ao consultar pedido*\n\nTente novamente mais tarde ou ligue: (11) 99999-9999'
        }
      });
    }
  }
}

export const whatsappService = new WhatsAppService();
