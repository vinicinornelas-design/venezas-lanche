-- Teste final do Realtime
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela está na publicação
SELECT EXISTS (
   SELECT FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime' 
   AND tablename = 'pedidos_unificados'
) as notificacoes_habilitadas;

-- 2. Inserir pedido de teste com número aleatório
INSERT INTO pedidos_unificados (
    id,
    numero_pedido,
    itens,
    origem,
    metodo_pagamento,
    cliente_nome,
    cliente_telefone,
    cliente_endereco,
    cliente_bairro,
    taxa_entrega,
    desconto,
    subtotal,
    total,
    status,
    pago
) VALUES (
    gen_random_uuid(),
    (SELECT COALESCE(MAX(numero_pedido), 0) + 1 FROM pedidos_unificados),
    '[
        {
            "nome": "Teste Final Realtime",
            "categoria": "TRADICIONAIS",
            "adicionais": [],
            "quantidade": 1,
            "preco_unitario": 35
        }
    ]'::jsonb,
    'DELIVERY',
    'pix',
    'Cliente Teste Final',
    '(11) 55555-5555',
    'Rua Teste Final, 999',
    'Centro',
    '5.00',
    '0.00',
    '35.00',
    '40.00',
    'PENDENTE',
    false
);

-- 3. Verificar últimos 3 pedidos
SELECT 
    numero_pedido,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
ORDER BY created_at DESC 
LIMIT 3;
