-- Script para habilitar notificações em tempo real no Supabase
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela pedidos_unificados existe
SELECT EXISTS (
   SELECT FROM pg_tables
   WHERE  schemaname = 'public'
   AND    tablename  = 'pedidos_unificados'
) as tabela_existe;

-- 2. Habilitar publicação para a tabela pedidos_unificados
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos_unificados;

-- 3. Verificar se a publicação foi habilitada
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'pedidos_unificados';

-- 4. Verificar configurações de RLS
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'pedidos_unificados';

-- 5. Verificar políticas RLS
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pedidos_unificados';

-- 6. Testar inserção de pedido para verificar notificações
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
    9995,
    '[
        {
            "nome": "Teste Notificação",
            "categoria": "TRADICIONAIS",
            "adicionais": [],
            "quantidade": 1,
            "preco_unitario": 15
        }
    ]'::jsonb,
    'DELIVERY',
    'dinheiro',
    'Cliente Teste Notificação',
    '(11) 77777-7777',
    'Rua Teste, 999',
    'Centro',
    '5.00',
    '0.00',
    '15.00',
    '20.00',
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
WHERE numero_pedido = 9995;

-- 8. Verificar configurações de publicação
SELECT 
    pubname,
    puballtables,
    pubinsert,
    pubupdate,
    pubdelete,
    pubtruncate
FROM pg_publication 
WHERE pubname = 'supabase_realtime';
