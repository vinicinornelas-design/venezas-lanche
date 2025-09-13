-- Fix security warnings by setting search_path for functions

-- Fix populate_funcionario_nome function
CREATE OR REPLACE FUNCTION populate_funcionario_nome()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If funcionario_id is provided, get the name from funcionarios table
  IF NEW.funcionario_id IS NOT NULL THEN
    SELECT nome INTO NEW.funcionario_nome
    FROM funcionarios 
    WHERE id = NEW.funcionario_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix update_mesa_stats function
CREATE OR REPLACE FUNCTION update_mesa_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix update_daily_revenue function
CREATE OR REPLACE FUNCTION update_daily_revenue()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;