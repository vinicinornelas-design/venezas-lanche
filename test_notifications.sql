-- Script para testar e criar notificações manualmente

-- 1. Verificar se a tabela notifications existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'notifications';

-- 2. Se a tabela não existir, criar ela
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
  order_id UUID,
  metadata JSONB
);

-- 3. Habilitar RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas básicas
DROP POLICY IF EXISTS "Users can read notifications" ON notifications;
CREATE POLICY "Users can read notifications" ON notifications
  FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert notifications" ON notifications;
CREATE POLICY "Users can insert notifications" ON notifications
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can update notifications" ON notifications;
CREATE POLICY "Users can update notifications" ON notifications
  FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can delete notifications" ON notifications;
CREATE POLICY "Users can delete notifications" ON notifications
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. Inserir notificação de teste
INSERT INTO notifications (title, message, type, priority, target_role, metadata) VALUES
('Teste de Notificação', 'Esta é uma notificação de teste para verificar se o sistema está funcionando.', 'INFO', 'MEDIUM', 'CAIXA', '{"test": true}');

-- 6. Verificar se a notificação foi inserida
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 5;
