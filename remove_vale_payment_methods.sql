-- Script para remover opções de Vale Refeição e Vale Alimentação
-- Execute este script no painel do Supabase (SQL Editor)

-- 1. Remover os métodos de pagamento de vale da tabela payment_methods
DELETE FROM payment_methods WHERE nome IN ('Vale Refeição', 'Vale Alimentação');

-- 2. Atualizar constraint da tabela pedidos
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_metodo_pagamento_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_metodo_pagamento_check 
CHECK (metodo_pagamento = ANY (ARRAY[
  'Dinheiro'::text, 
  'PIX'::text, 
  'Cartão de Débito'::text, 
  'Cartão de Crédito'::text
]));

-- 3. Atualizar constraint da tabela pedidos_unificados
ALTER TABLE pedidos_unificados DROP CONSTRAINT IF EXISTS pedidos_unificados_metodo_pagamento_check;
ALTER TABLE pedidos_unificados ADD CONSTRAINT pedidos_unificados_metodo_pagamento_check 
CHECK (metodo_pagamento = ANY (ARRAY[
  'Dinheiro'::text, 
  'PIX'::text, 
  'Cartão de Débito'::text, 
  'Cartão de Crédito'::text
]));

-- 4. Atualizar taxas dos cartões para os valores corretos
UPDATE payment_methods 
SET fee_value = 2.5 
WHERE nome = 'Cartão de Débito';

UPDATE payment_methods 
SET fee_value = 3.5 
WHERE nome = 'Cartão de Crédito';

-- 5. Verificar os métodos de pagamento restantes
SELECT id, nome, fee_type, fee_value, ativo FROM payment_methods ORDER BY nome;
