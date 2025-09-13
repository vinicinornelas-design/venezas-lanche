-- Corrigir função para ter search_path definido (resolver warning de segurança)
CREATE OR REPLACE FUNCTION update_funcionario_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;