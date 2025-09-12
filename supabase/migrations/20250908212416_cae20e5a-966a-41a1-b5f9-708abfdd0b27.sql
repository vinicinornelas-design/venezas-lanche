-- Fix pedidos status constraint to match the values used in the app
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_status_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_status_check 
CHECK (status IN ('PENDENTE', 'PREPARANDO', 'PRONTO', 'ENTREGUE', 'CANCELADO'));

-- Fix the triggers that are trying to access non-existent fields
DROP TRIGGER IF EXISTS trigger_update_funcionario_stats ON pedidos;
DROP TRIGGER IF EXISTS trigger_update_mesa_stats ON mesas;

-- Recreate the funcionario stats trigger for pedidos only
CREATE TRIGGER trigger_update_funcionario_stats_pedidos
    BEFORE INSERT OR UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION populate_funcionario_nome();

-- Add etiqueta field to mesas table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'mesas' AND column_name = 'etiqueta') THEN
        ALTER TABLE mesas ADD COLUMN etiqueta text;
    END IF;
END $$;

-- Create daily revenue trigger for pedidos
CREATE OR REPLACE TRIGGER trigger_update_daily_revenue
    AFTER UPDATE ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_revenue();