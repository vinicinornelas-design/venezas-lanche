-- Script para adicionar campo taxa_pagamento na tabela pedidos_unificados
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna taxa_pagamento na tabela pedidos_unificados
ALTER TABLE pedidos_unificados 
ADD COLUMN IF NOT EXISTS taxa_pagamento DECIMAL(10,2) DEFAULT 0.00;

-- Atualizar registros existentes para ter taxa_pagamento = 0
UPDATE pedidos_unificados 
SET taxa_pagamento = 0.00 
WHERE taxa_pagamento IS NULL;

-- Verificar se a coluna foi adicionada corretamente
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
AND column_name = 'taxa_pagamento';
