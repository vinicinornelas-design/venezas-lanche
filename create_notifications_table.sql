-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('NEW_ORDER', 'ORDER_UPDATE', 'SYSTEM', 'INFO')),
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  target_role VARCHAR(50) CHECK (target_role IN ('ADMIN', 'CAIXA', 'CHAPEIRO', 'ATENDENTE', 'COZINHEIRA', 'GARCOM')),
  order_id UUID REFERENCES pedidos_unificados(id) ON DELETE CASCADE,
  metadata JSONB
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_notifications_target_role ON notifications(target_role);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- Habilitar RLS (Row Level Security)
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários autenticados
CREATE POLICY "Users can read notifications" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserção para usuários autenticados
CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização para usuários autenticados
CREATE POLICY "Users can update notifications" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir exclusão para usuários autenticados
CREATE POLICY "Users can delete notifications" ON notifications
  FOR DELETE USING (auth.role() = 'authenticated');

-- Função para criar notificação de novo pedido
CREATE OR REPLACE FUNCTION create_new_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    title,
    message,
    type,
    priority,
    target_role,
    order_id,
    metadata
  ) VALUES (
    'Novo Pedido Recebido',
    CASE 
      WHEN NEW.tipo_pedido = 'MESA' THEN 
        'Novo pedido na mesa ' || COALESCE(NEW.numero_mesa::text, 'N/A')
      WHEN NEW.tipo_pedido = 'DELIVERY' THEN 
        'Novo pedido delivery para ' || COALESCE(NEW.nome_cliente, 'Cliente')
      ELSE 
        'Novo pedido no balcão'
    END,
    'NEW_ORDER',
    'HIGH',
    'CAIXA',
    NEW.id,
    jsonb_build_object(
      'order_type', NEW.tipo_pedido,
      'table_number', NEW.numero_mesa,
      'customer_name', NEW.nome_cliente,
      'total_amount', NEW.total
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar notificação quando um novo pedido é inserido
CREATE TRIGGER trigger_new_order_notification
  AFTER INSERT ON pedidos_unificados
  FOR EACH ROW
  EXECUTE FUNCTION create_new_order_notification();

-- Inserir algumas notificações de exemplo
INSERT INTO notifications (title, message, type, priority, target_role) VALUES
('Sistema Iniciado', 'Sistema de notificações ativado com sucesso!', 'SYSTEM', 'LOW', 'CAIXA'),
('Bem-vindo', 'Bem-vindo ao sistema de notificações do LancheFlow!', 'INFO', 'LOW', 'CAIXA');
