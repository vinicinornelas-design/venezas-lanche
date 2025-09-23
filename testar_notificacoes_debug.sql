-- Script para debug das notificações
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela está na publicação
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

-- 3. Verificar se há pedidos recentes
SELECT 
    numero_pedido,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Inserir pedido de teste
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
    9999,
    '[
        {
            "nome": "Teste Debug Notificação",
            "categoria": "TRADICIONAIS",
            "adicionais": [],
            "quantidade": 1,
            "preco_unitario": 30
        }
    ]'::jsonb,
    'DELIVERY',
    'pix',
    'Cliente Debug Teste',
    '(11) 88888-8888',
    'Rua Debug, 456',
    'Centro',
    '5.00',
    '0.00',
    '30.00',
    '35.00',
    'PENDENTE',
    false
);

-- 5. Verificar se o pedido foi inserido
SELECT 
    numero_pedido,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
WHERE numero_pedido = 9999;
