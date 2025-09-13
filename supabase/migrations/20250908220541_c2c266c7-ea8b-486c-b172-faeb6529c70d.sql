-- Fix mesa status constraint (ensure all valid statuses are allowed)
ALTER TABLE public.mesas DROP CONSTRAINT IF EXISTS mesas_status_check;
ALTER TABLE public.mesas ADD CONSTRAINT mesas_status_check CHECK (status IN ('LIVRE', 'OCUPADA', 'RESERVADA', 'LIMPEZA'));

-- Fix trigger issues - remove problematic triggers temporarily
DROP TRIGGER IF EXISTS update_funcionario_stats_pedidos ON public.pedidos;
DROP TRIGGER IF EXISTS update_funcionario_stats_mesas ON public.mesas;

-- Recreate proper triggers
CREATE OR REPLACE FUNCTION public.update_funcionario_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
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
$function$;

-- Add trigger for mesas updates
CREATE TRIGGER update_funcionario_stats_mesas
  AFTER UPDATE ON public.mesas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_funcionario_stats();

-- Add trigger for pedidos updates  
CREATE TRIGGER update_funcionario_stats_pedidos
  AFTER UPDATE ON public.pedidos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_funcionario_stats();