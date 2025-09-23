-- Script para verificar se os pedidos do cardápio público estão chegando no sistema
-- Execute este script no Supabase SQL Editor

-- Verificar todos os pedidos recentes
SELECT 
    id,
    codigo,
    cliente_nome,
    cliente_telefone,
    total,
    status,
    origem,
    metodo_pagamento,
    created_at,
    CASE 
        WHEN origem = 'DELIVERY' THEN 'Cardápio Público'
        WHEN origem = 'BALCAO' THEN 'Balcão'
        ELSE origem
    END as fonte_pedido
FROM pedidos_unificados 
ORDER BY created_at DESC 
LIMIT 10;

-- Contar pedidos por origem
SELECT 
    origem,
    COUNT(*) as total_pedidos,
    SUM(total) as valor_total
FROM pedidos_unificados 
GROUP BY origem
ORDER BY total_pedidos DESC;

-- Verificar pedidos do cardápio público especificamente
SELECT 
    codigo,
    cliente_nome,
    cliente_telefone,
    cliente_endereco,
    cliente_bairro,
    total,
    taxa_entrega,
    taxa_pagamento,
    metodo_pagamento,
    status,
    created_at
FROM pedidos_unificados 
WHERE origem = 'DELIVERY'
ORDER BY created_at DESC 
LIMIT 5;

-- Verificar estrutura dos itens
SELECT 
    codigo,
    cliente_nome,
    itens,
    created_at
FROM pedidos_unificados 
WHERE origem = 'DELIVERY'
ORDER BY created_at DESC 
LIMIT 3;

-- Verificar se há pedidos com problemas
SELECT 
    codigo,
    cliente_nome,
    CASE 
        WHEN cliente_nome IS NULL OR cliente_nome = '' THEN 'SEM NOME'
        WHEN cliente_telefone IS NULL OR cliente_telefone = '' THEN 'SEM TELEFONE'
        WHEN cliente_endereco IS NULL OR cliente_endereco = '' THEN 'SEM ENDEREÇO'
        ELSE 'OK'
    END as problema,
    created_at
FROM pedidos_unificados 
WHERE origem = 'DELIVERY'
ORDER BY created_at DESC;
