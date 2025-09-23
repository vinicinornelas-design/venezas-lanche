-- Script para testar se as notificações estão funcionando
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela está na publicação (deve retornar true)
SELECT EXISTS (
   SELECT FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime' 
   AND tablename = 'pedidos_unificados'
) as notificacoes_habilitadas;

-- 2. Verificar configurações da publicação
SELECT 
    pubname,
    puballtables,
    pubinsert,
    pubupdate,
    pubdelete
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 3. Inserir pedido de teste para disparar notificação
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
    9998,
    '[
        {
            "nome": "Teste Notificação Sistema",
            "categoria": "TRADICIONAIS",
            "adicionais": [],
            "quantidade": 1,
            "preco_unitario": 25
        }
    ]'::jsonb,
    'DELIVERY',
    'pix',
    'Cliente Teste Notificação',
    '(11) 99999-9999',
    'Rua Teste Notificação, 123',
    'Centro',
    '5.00',
    '0.00',
    '25.00',
    '30.00',
    'PENDENTE',
    false
);

-- 4. Verificar se o pedido foi inserido
SELECT 
    numero_pedido,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
WHERE numero_pedido = 9998
ORDER BY created_at DESC;

-- 5. Verificar últimos 5 pedidos
SELECT 
    numero_pedido,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
ORDER BY created_at DESC 
LIMIT 5;
