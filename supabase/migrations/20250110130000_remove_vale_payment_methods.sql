-- Remove Vale Refeição and Vale Alimentação payment methods
DELETE FROM payment_methods WHERE nome IN ('Vale Refeição', 'Vale Alimentação');

-- Update pedidos table constraint to remove vale options
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_metodo_pagamento_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_metodo_pagamento_check 
CHECK (metodo_pagamento = ANY (ARRAY[
  'Dinheiro'::text, 
  'PIX'::text, 
  'Cartão de Débito'::text, 
  'Cartão de Crédito'::text
]));

-- Update pedidos_unificados table constraint to remove vale options
ALTER TABLE pedidos_unificados DROP CONSTRAINT IF EXISTS pedidos_unificados_metodo_pagamento_check;
ALTER TABLE pedidos_unificados ADD CONSTRAINT pedidos_unificados_metodo_pagamento_check 
CHECK (metodo_pagamento = ANY (ARRAY[
  'Dinheiro'::text, 
  'PIX'::text, 
  'Cartão de Débito'::text, 
  'Cartão de Crédito'::text
]));

-- Update payment methods with correct fees
UPDATE payment_methods 
SET fee_value = 2.5 
WHERE nome = 'Cartão de Débito';

UPDATE payment_methods 
SET fee_value = 3.5 
WHERE nome = 'Cartão de Crédito';
