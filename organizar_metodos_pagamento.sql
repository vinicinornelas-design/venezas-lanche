-- Script para organizar métodos de pagamento no restaurant_config
-- Execute este script no Supabase SQL Editor

-- 1. Verificar configuração atual
SELECT 
    id,
    formas_pagamento,
    created_at
FROM restaurant_config 
LIMIT 1;

-- 2. Atualizar formas de pagamento com organização correta
UPDATE restaurant_config
SET formas_pagamento = jsonb_build_array(
    -- Dinheiro
    jsonb_build_object('nome', 'Dinheiro', 'taxa', 0.00),
    
    -- Cartões
    jsonb_build_object('nome', 'Débito', 'taxa', 0.00),
    jsonb_build_object('nome', 'Crédito', 'taxa', 0.00),
    
    -- Vale Refeição
    jsonb_build_object('nome', 'VR', 'taxa', 0.00),
    jsonb_build_object('nome', 'Sodexo', 'taxa', 0.00),
    jsonb_build_object('nome', 'Ticket', 'taxa', 0.00),
    jsonb_build_object('nome', 'Alelo', 'taxa', 0.00)
)
WHERE id = (SELECT id FROM restaurant_config LIMIT 1);

-- 3. Verificar se foi atualizado
SELECT 
    id,
    formas_pagamento,
    updated_at
FROM restaurant_config 
LIMIT 1;

-- 4. Verificar estrutura dos métodos de pagamento
SELECT 
    jsonb_array_elements(formas_pagamento) as metodo_pagamento
FROM restaurant_config 
LIMIT 1;
