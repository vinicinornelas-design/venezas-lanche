import { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/integrations/supabase/client';
import { whatsappService } from '@/services/whatsappService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Verificação do webhook
    const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;

    if (!mode || !token || !challenge) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    try {
      // Buscar configuração do WhatsApp
      const { data: config } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('enabled', true)
        .single();

      if (!config) {
        return res.status(400).json({ error: 'WhatsApp not configured' });
      }

      const verificationResult = await whatsappService.verifyWebhook(
        mode as string,
        token as string,
        challenge as string
      );

      if (verificationResult) {
        return res.status(200).send(challenge);
      } else {
        return res.status(403).json({ error: 'Verification failed' });
      }
    } catch (error) {
      console.error('Webhook verification error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    // Processamento de mensagens
    try {
      const body = req.body;

      // Log da mensagem recebida
      await supabase
        .from('whatsapp_messages_log')
        .insert({
          restaurant_id: body.restaurant_id || null,
          message_id: body.entry?.[0]?.id || 'unknown',
          phone_number: body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.from || 'unknown',
          message_type: 'received',
          content: JSON.stringify(body),
          status: 'success'
        });

      // Processar mensagem
      await whatsappService.handleWebhook(body);

      return res.status(200).json({ status: 'success' });
    } catch (error) {
      console.error('Webhook processing error:', error);
      
      // Log do erro
      await supabase
        .from('whatsapp_messages_log')
        .insert({
          restaurant_id: null,
          message_id: 'error',
          phone_number: 'unknown',
          message_type: 'received',
          content: JSON.stringify(req.body),
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });

      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
