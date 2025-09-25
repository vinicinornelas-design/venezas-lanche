import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone, config } = req.body;

    if (!phone || !config) {
      return res.status(400).json({ error: 'Phone and config are required' });
    }

    // Enviar mensagem de teste
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${config.phone_number_id}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'text',
          text: {
            body: `🧪 *TESTE DE INTEGRAÇÃO WHATSAPP*\n\n✅ Sua integração está funcionando perfeitamente!\n\n🍔 Veneza's Lanches\n📱 Sistema de notificações ativo\n\nEsta é uma mensagem de teste enviada em ${new Date().toLocaleString('pt-BR')}`
          }
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`WhatsApp API Error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();

    // Log da mensagem de teste
    await supabase
      .from('whatsapp_messages_log')
      .insert({
        restaurant_id: null, // Será preenchido quando tivermos o restaurant_id
        message_id: result.messages?.[0]?.id || 'test',
        phone_number: phone,
        message_type: 'sent',
        content: 'Mensagem de teste',
        status: 'success'
      });

    return res.status(200).json({ 
      success: true, 
      message: 'Mensagem de teste enviada com sucesso!',
      messageId: result.messages?.[0]?.id
    });

  } catch (error) {
    console.error('Test message error:', error);
    
    // Log do erro
    await supabase
      .from('whatsapp_messages_log')
      .insert({
        restaurant_id: null,
        message_id: 'test_error',
        phone_number: req.body.phone || 'unknown',
        message_type: 'sent',
        content: 'Mensagem de teste',
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });

    return res.status(500).json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Erro interno do servidor'
    });
  }
}
