-- Fix database functions to use correct column names

-- Update the update_mesa_stats function to use correct field name
CREATE OR REPLACE FUNCTION public.update_mesa_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log mesa activity
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO mesas_atividade (mesa_id, funcionario_id, acao, observacoes)
    VALUES (
      NEW.id,
      NEW.responsavel_funcionario_id,  -- This is the correct field name in mesas table
      'STATUS_CHANGED',
      'Status alterado de ' || OLD.status || ' para ' || NEW.status
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the update_funcionario_stats function to use correct field names
CREATE OR REPLACE FUNCTION public.update_funcionario_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update stats when mesa is assigned to funcionario
  IF TG_TABLE_NAME = 'mesas' AND NEW.responsavel_funcionario_id IS NOT NULL THEN
    UPDATE funcionarios 
    SET 
      last_activity = NOW(),
      total_mesas_atendidas = total_mesas_atendidas + 1
    WHERE id = NEW.responsavel_funcionario_id;
  END IF;
  
  -- Update stats when pedido is processed by funcionario
  IF TG_TABLE_NAME = 'pedidos' AND NEW.funcionario_id IS NOT NULL THEN
    UPDATE funcionarios 
    SET 
      last_activity = NOW(),
      total_pedidos_processados = total_pedidos_processados + 1
    WHERE id = NEW.funcionario_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create triggers for these functions if they don't exist
DROP TRIGGER IF EXISTS update_mesa_stats_trigger ON public.mesas;
CREATE TRIGGER update_mesa_stats_trigger
  AFTER UPDATE ON public.mesas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mesa_stats();

DROP TRIGGER IF EXISTS update_funcionario_stats_mesas_trigger ON public.mesas;
CREATE TRIGGER update_funcionario_stats_mesas_trigger
  AFTER UPDATE ON public.mesas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_funcionario_stats();

DROP TRIGGER IF EXISTS update_funcionario_stats_pedidos_trigger ON public.pedidos;
CREATE TRIGGER update_funcionario_stats_pedidos_trigger
  AFTER UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_funcionario_stats();