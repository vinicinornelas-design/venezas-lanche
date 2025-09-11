-- Atualizar tabela customer_remarketing para ter mais funcionalidades
ALTER TABLE customer_remarketing 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'NORMAL',
ADD COLUMN IF NOT EXISTS campaign_type TEXT DEFAULT 'GENERAL',
ADD COLUMN IF NOT EXISTS scheduled_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS response_received BOOLEAN DEFAULT FALSE;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_customer_remarketing_status ON customer_remarketing(status);
CREATE INDEX IF NOT EXISTS idx_customer_remarketing_priority ON customer_remarketing(priority);

-- Atualizar tabela funcionarios para ter mais controle
ALTER TABLE funcionarios 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS total_mesas_atendidas INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_pedidos_processados INTEGER DEFAULT 0;

-- Criar trigger para atualizar estatísticas de funcionários automaticamente
CREATE OR REPLACE FUNCTION update_funcionario_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar estatísticas quando mesa é atribuída a funcionário
  IF TG_TABLE_NAME = 'mesas' AND NEW.responsavel_funcionario_id IS NOT NULL THEN
    UPDATE funcionarios 
    SET 
      last_activity = NOW(),
      total_mesas_atendidas = total_mesas_atendidas + 1
    WHERE id = NEW.responsavel_funcionario_id;
  END IF;
  
  -- Atualizar estatísticas quando pedido é processado por funcionário
  IF TG_TABLE_NAME = 'pedidos' AND NEW.funcionario_id IS NOT NULL THEN
    UPDATE funcionarios 
    SET 
      last_activity = NOW(),
      total_pedidos_processados = total_pedidos_processados + 1
    WHERE id = NEW.funcionario_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers
DROP TRIGGER IF EXISTS trigger_mesa_funcionario_stats ON mesas;
CREATE TRIGGER trigger_mesa_funcionario_stats
  AFTER UPDATE ON mesas
  FOR EACH ROW
  EXECUTE FUNCTION update_funcionario_stats();

DROP TRIGGER IF EXISTS trigger_pedido_funcionario_stats ON pedidos;
CREATE TRIGGER trigger_pedido_funcionario_stats
  AFTER UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION update_funcionario_stats();

-- Criar políticas RLS mais específicas para customer_remarketing
DROP POLICY IF EXISTS "Admins can manage customer remarketing" ON customer_remarketing;
CREATE POLICY "Admins can manage customer remarketing" ON customer_remarketing
  FOR ALL USING (is_admin());

CREATE POLICY "Staff can view customer remarketing" ON customer_remarketing
  FOR SELECT USING (auth.uid() IS NOT NULL);