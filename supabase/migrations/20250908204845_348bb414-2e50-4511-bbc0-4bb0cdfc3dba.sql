-- Add missing functionality for restaurant management system

-- Add funcionario_nome to pedidos to track who created each order
ALTER TABLE pedidos ADD COLUMN funcionario_nome TEXT;

-- Create trigger to automatically populate funcionario_nome when pedido is created
CREATE OR REPLACE FUNCTION populate_funcionario_nome()
RETURNS TRIGGER AS $$
BEGIN
  -- If funcionario_id is provided, get the name from funcionarios table
  IF NEW.funcionario_id IS NOT NULL THEN
    SELECT nome INTO NEW.funcionario_nome
    FROM funcionarios 
    WHERE id = NEW.funcionario_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_funcionario_nome_trigger
  BEFORE INSERT OR UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION populate_funcionario_nome();

-- Initialize default tables (1-20) if they don't exist
INSERT INTO mesas (numero, status, etiqueta)
SELECT 
  generate_series(1, 20) as numero,
  'LIVRE' as status,
  'Mesa ' || generate_series(1, 20) as etiqueta
WHERE NOT EXISTS (SELECT 1 FROM mesas WHERE numero BETWEEN 1 AND 20);

-- Add observacoes field to mesas for notes
ALTER TABLE mesas ADD COLUMN IF NOT EXISTS observacoes TEXT;

-- Update mesas trigger to track employee activities
CREATE OR REPLACE FUNCTION update_mesa_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Log mesa activity
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO mesas_atividade (mesa_id, funcionario_id, acao, observacoes)
    VALUES (
      NEW.id,
      NEW.responsavel_funcionario_id,
      'STATUS_CHANGED',
      'Status alterado de ' || OLD.status || ' para ' || NEW.status
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS mesa_activity_trigger ON mesas;
CREATE TRIGGER mesa_activity_trigger
  AFTER UPDATE ON mesas
  FOR EACH ROW
  EXECUTE FUNCTION update_mesa_stats();

-- Create daily revenue tracking for better analytics
CREATE TABLE IF NOT EXISTS daily_revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  average_ticket DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on daily_revenue
ALTER TABLE daily_revenue ENABLE ROW LEVEL SECURITY;

-- Create policy for daily_revenue
CREATE POLICY "Authenticated users can view daily revenue" ON daily_revenue
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage daily revenue" ON daily_revenue
  FOR ALL USING (is_admin());

-- Function to update daily revenue stats
CREATE OR REPLACE FUNCTION update_daily_revenue()
RETURNS TRIGGER AS $$
BEGIN
  -- Update daily revenue when a pedido is marked as paid or completed
  IF (TG_OP = 'UPDATE' AND OLD.status != NEW.status AND NEW.status IN ('CONCLUIDO', 'ENTREGUE')) 
     OR (TG_OP = 'UPDATE' AND OLD.pago != NEW.pago AND NEW.pago = true) THEN
    
    INSERT INTO daily_revenue (date, total_revenue, total_orders, average_ticket)
    SELECT 
      CURRENT_DATE,
      COALESCE(SUM(total), 0),
      COUNT(*),
      COALESCE(AVG(total), 0)
    FROM pedidos 
    WHERE DATE(created_at) = CURRENT_DATE 
      AND status IN ('CONCLUIDO', 'ENTREGUE')
      AND pago = true
    ON CONFLICT (date) DO UPDATE SET
      total_revenue = EXCLUDED.total_revenue,
      total_orders = EXCLUDED.total_orders,
      average_ticket = EXCLUDED.average_ticket,
      updated_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for daily revenue updates
DROP TRIGGER IF EXISTS update_daily_revenue_trigger ON pedidos;
CREATE TRIGGER update_daily_revenue_trigger
  AFTER UPDATE ON pedidos
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_revenue();

-- Add image support to menu items (already exists as foto_url)
-- Ensure foto_url is properly indexed for better performance
CREATE INDEX IF NOT EXISTS idx_itens_cardapio_foto ON itens_cardapio(foto_url) WHERE foto_url IS NOT NULL;

-- Add notification system for real-time updates
CREATE TABLE IF NOT EXISTS system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  target_role TEXT, -- ADMIN, ATENDENTE, null for all
  read_by UUID[], -- array of user_ids who have read this
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on notifications
ALTER TABLE system_notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view relevant notifications" ON system_notifications
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND 
    (target_role IS NULL OR target_role = (
      SELECT papel FROM profiles WHERE user_id = auth.uid()
    ))
  );

CREATE POLICY "Admins can manage notifications" ON system_notifications
  FOR ALL USING (is_admin());