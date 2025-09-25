-- Criar tabela de configuração do WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_config (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurant_config(id) ON DELETE CASCADE,
    phone_number_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    webhook_verify_token TEXT NOT NULL,
    business_account_id TEXT NOT NULL,
    enabled BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para logs de mensagens WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurant_config(id) ON DELETE CASCADE,
    message_id TEXT,
    phone_number TEXT NOT NULL,
    message_type TEXT NOT NULL, -- 'sent', 'received'
    content TEXT,
    status TEXT, -- 'success', 'failed', 'pending'
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para templates de mensagens
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurant_config(id) ON DELETE CASCADE,
    template_name TEXT NOT NULL,
    template_type TEXT NOT NULL, -- 'order_confirmation', 'status_update', 'menu', etc.
    content TEXT NOT NULL,
    variables JSONB DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_config_restaurant_id ON whatsapp_config(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_restaurant_id ON whatsapp_messages_log(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_phone ON whatsapp_messages_log(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_restaurant_id ON whatsapp_templates(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_templates_type ON whatsapp_templates(template_type);

-- Habilitar RLS (Row Level Security)
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "Users can view their own whatsapp config" ON whatsapp_config
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM restaurant_config WHERE id = restaurant_id
    ));

CREATE POLICY "Users can update their own whatsapp config" ON whatsapp_config
    FOR UPDATE USING (auth.uid() IN (
        SELECT user_id FROM restaurant_config WHERE id = restaurant_id
    ));

CREATE POLICY "Users can insert their own whatsapp config" ON whatsapp_config
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM restaurant_config WHERE id = restaurant_id
    ));

CREATE POLICY "Users can view their own whatsapp messages" ON whatsapp_messages_log
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM restaurant_config WHERE id = restaurant_id
    ));

CREATE POLICY "Users can insert their own whatsapp messages" ON whatsapp_messages_log
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM restaurant_config WHERE id = restaurant_id
    ));

CREATE POLICY "Users can view their own whatsapp templates" ON whatsapp_templates
    FOR SELECT USING (auth.uid() IN (
        SELECT user_id FROM restaurant_config WHERE id = restaurant_id
    ));

CREATE POLICY "Users can update their own whatsapp templates" ON whatsapp_templates
    FOR UPDATE USING (auth.uid() IN (
        SELECT user_id FROM restaurant_config WHERE id = restaurant_id
    ));

CREATE POLICY "Users can insert their own whatsapp templates" ON whatsapp_templates
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT user_id FROM restaurant_config WHERE id = restaurant_id
    ));

CREATE POLICY "Users can delete their own whatsapp templates" ON whatsapp_templates
    FOR DELETE USING (auth.uid() IN (
        SELECT user_id FROM restaurant_config WHERE id = restaurant_id
    ));

-- Inserir templates padrão
INSERT INTO whatsapp_templates (restaurant_id, template_name, template_type, content, variables) 
SELECT 
    rc.id,
    'Confirmação de Pedido',
    'order_confirmation',
    '🍔 *Pedido Confirmado!*\n\nSeu pedido #{order_id} foi recebido e está sendo preparado.\n\n💰 *Total:* R$ {total}\n🚚 *Entrega:* {delivery_method}\n💳 *Pagamento:* {payment_method}\n\nVocê receberá atualizações sobre o status do seu pedido.\n\nObrigado por escolher Veneza''s Lanches! 🍕',
    '{"order_id": "string", "total": "number", "delivery_method": "string", "payment_method": "string"}'::jsonb
FROM restaurant_config rc
WHERE NOT EXISTS (
    SELECT 1 FROM whatsapp_templates wt 
    WHERE wt.restaurant_id = rc.id 
    AND wt.template_type = 'order_confirmation'
);

INSERT INTO whatsapp_templates (restaurant_id, template_name, template_type, content, variables) 
SELECT 
    rc.id,
    'Atualização de Status',
    'status_update',
    '{status_emoji} *{status_text}*\n\nPedido #{order_id}\n\n{status_description}\n\nVeneza''s Lanches 🍔',
    '{"status_emoji": "string", "status_text": "string", "order_id": "string", "status_description": "string"}'::jsonb
FROM restaurant_config rc
WHERE NOT EXISTS (
    SELECT 1 FROM whatsapp_templates wt 
    WHERE wt.restaurant_id = rc.id 
    AND wt.template_type = 'status_update'
);

INSERT INTO whatsapp_templates (restaurant_id, template_name, template_type, content, variables) 
SELECT 
    rc.id,
    'Notificação de Novo Pedido',
    'new_order',
    '🆕 *NOVO PEDIDO RECEBIDO!*\n\n👤 *Cliente:* {customer_name}\n📱 *Telefone:* {customer_phone}\n🆔 *Pedido:* #{order_id}\n\n📋 *Itens:*\n{items_list}\n\n💰 *Total:* R$ {total}\n🚚 *Entrega:* {delivery_method}\n💳 *Pagamento:* {payment_method}{address_text}{notes_text}\n\n⏰ *Horário:* {order_time}',
    '{"customer_name": "string", "customer_phone": "string", "order_id": "string", "items_list": "string", "total": "number", "delivery_method": "string", "payment_method": "string", "address_text": "string", "notes_text": "string", "order_time": "string"}'::jsonb
FROM restaurant_config rc
WHERE NOT EXISTS (
    SELECT 1 FROM whatsapp_templates wt 
    WHERE wt.restaurant_id = rc.id 
    AND wt.template_type = 'new_order'
);

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers para updated_at
CREATE TRIGGER update_whatsapp_config_updated_at 
    BEFORE UPDATE ON whatsapp_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at 
    BEFORE UPDATE ON whatsapp_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE whatsapp_config IS 'Configurações da integração WhatsApp Business API';
COMMENT ON TABLE whatsapp_messages_log IS 'Log de mensagens enviadas e recebidas via WhatsApp';
COMMENT ON TABLE whatsapp_templates IS 'Templates de mensagens personalizáveis para WhatsApp';

COMMENT ON COLUMN whatsapp_config.phone_number_id IS 'ID do número de telefone no WhatsApp Business API';
COMMENT ON COLUMN whatsapp_config.access_token IS 'Token de acesso da API do WhatsApp';
COMMENT ON COLUMN whatsapp_config.webhook_verify_token IS 'Token para verificação do webhook';
COMMENT ON COLUMN whatsapp_config.business_account_id IS 'ID da conta business no Facebook';
COMMENT ON COLUMN whatsapp_config.enabled IS 'Se a integração está ativa';

COMMENT ON COLUMN whatsapp_templates.template_name IS 'Nome do template para identificação';
COMMENT ON COLUMN whatsapp_templates.template_type IS 'Tipo do template (order_confirmation, status_update, etc.)';
COMMENT ON COLUMN whatsapp_templates.content IS 'Conteúdo da mensagem com placeholders';
COMMENT ON COLUMN whatsapp_templates.variables IS 'Definição das variáveis do template';
