-- Corrigir constraint de métodos de pagamento na tabela pedidos
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_metodo_pagamento_check;

-- Adicionar novo constraint que aceita os métodos de pagamento corretos
ALTER TABLE pedidos ADD CONSTRAINT pedidos_metodo_pagamento_check 
CHECK (metodo_pagamento = ANY (ARRAY[
  'Dinheiro'::text, 
  'PIX'::text, 
  'Cartão de Débito'::text, 
  'Cartão de Crédito'::text, 
  'Vale Refeição'::text,
  'Vale Alimentação'::text
]));

-- Corrigir também o constraint do payment_methods (estava com "percent" mas o código usa "percentage")
ALTER TABLE payment_methods DROP CONSTRAINT IF EXISTS payment_methods_fee_type_check;
ALTER TABLE payment_methods ADD CONSTRAINT payment_methods_fee_type_check 
CHECK (fee_type = ANY (ARRAY['fixed'::text, 'percentage'::text]));