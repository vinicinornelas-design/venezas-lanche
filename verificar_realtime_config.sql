-- Script para verificar configuração do Supabase Realtime
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela está na publicação
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'pedidos_unificados';

-- 2. Verificar configurações da publicação
SELECT 
    pubname,
    puballtables,
    pubinsert,
    pubupdate,
    pubdelete,
    pubtruncate
FROM pg_publication 
WHERE pubname = 'supabase_realtime';

-- 3. Verificar se a tabela existe e tem estrutura correta
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar políticas RLS
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pedidos_unificados';

-- 5. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'pedidos_unificados';

-- 6. Testar inserção de pedido
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
    10000,
    '[
        {
            "nome": "Teste Realtime Config",
            "categoria": "TRADICIONAIS",
            "adicionais": [],
            "quantidade": 1,
            "preco_unitario": 35
        }
    ]'::jsonb,
    'DELIVERY',
    'pix',
    'Cliente Teste Realtime',
    '(11) 11111-1111',
    'Rua Teste Realtime, 789',
    'Centro',
    '5.00',
    '0.00',
    '35.00',
    '40.00',
    'PENDENTE',
    false
);

-- 7. Verificar se o pedido foi inserido
SELECT 
    numero_pedido,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
WHERE numero_pedido = 10000;

-- 8. Verificar últimos 5 pedidos
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
