-- Script SIMPLES para testar inserção de pedido
-- Execute este script no Supabase SQL Editor

-- 1. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
ORDER BY ordinal_position;

-- 2. Inserir pedido de teste (apenas campos obrigatórios)
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
    9997,
    '[
        {
            "nome": "Hambúrguer Teste",
            "categoria": "TRADICIONAIS",
            "adicionais": [],
            "quantidade": 1,
            "preco_unitario": 25
        }
    ]'::jsonb,
    'DELIVERY',
    'dinheiro',
    'Cliente Teste',
    '(11) 99999-9999',
    'Rua Teste, 123',
    'Centro',
    '5.00',
    '0.00',
    '25.00',
    '30.00',
    'PENDENTE',
    false
);

-- 3. Verificar se foi inserido
SELECT 
    numero_pedido,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
WHERE numero_pedido = 9997;

-- 4. Verificar últimos pedidos
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
