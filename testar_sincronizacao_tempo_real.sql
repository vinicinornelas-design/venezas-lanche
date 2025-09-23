-- Script para testar a sincronização em tempo real dos pedidos
-- Execute este script no Supabase SQL Editor

-- 1. Verificar pedidos mais recentes (últimos 10 minutos)
SELECT 
    codigo,
    cliente_nome,
    origem,
    total,
    status,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at)) as segundos_atras
FROM pedidos_unificados 
WHERE created_at >= NOW() - INTERVAL '10 minutes'
ORDER BY created_at DESC;

-- 2. Verificar pedidos do cardápio público especificamente
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
    pago,
    created_at,
    EXTRACT(EPOCH FROM (NOW() - created_at)) as segundos_atras
FROM pedidos_unificados 
WHERE origem = 'DELIVERY'
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Verificar estrutura dos itens dos pedidos mais recentes
SELECT 
    codigo,
    cliente_nome,
    itens,
    created_at
FROM pedidos_unificados 
WHERE origem = 'DELIVERY'
ORDER BY created_at DESC 
LIMIT 3;

-- 4. Contar pedidos por status
SELECT 
    status,
    COUNT(*) as total,
    SUM(total) as valor_total
FROM pedidos_unificados 
WHERE origem = 'DELIVERY'
GROUP BY status
ORDER BY total DESC;

-- 5. Verificar pedidos com problemas de dados
SELECT 
    codigo,
    cliente_nome,
    CASE 
        WHEN cliente_nome IS NULL OR cliente_nome = '' THEN 'SEM NOME'
        WHEN cliente_telefone IS NULL OR cliente_telefone = '' THEN 'SEM TELEFONE'
        WHEN cliente_endereco IS NULL OR cliente_endereco = '' THEN 'SEM ENDEREÇO'
        WHEN total IS NULL OR total = 0 THEN 'SEM VALOR'
        ELSE 'OK'
    END as problema,
    created_at
FROM pedidos_unificados 
WHERE origem = 'DELIVERY'
ORDER BY created_at DESC;

-- 6. Verificar se há pedidos duplicados
SELECT 
    codigo,
    COUNT(*) as duplicatas,
    STRING_AGG(cliente_nome, ', ') as clientes
FROM pedidos_unificados 
GROUP BY codigo
HAVING COUNT(*) > 1
ORDER BY duplicatas DESC;

-- 7. Verificar performance da tabela
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename = 'pedidos_unificados'
ORDER BY attname;

-- 8. Verificar índices
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'pedidos_unificados';

-- 9. Inserir pedido de teste para verificar sincronização
INSERT INTO pedidos_unificados (
    id,
    codigo,
    itens,
    origem,
    observacoes,
    metodo_pagamento,
    cliente_nome,
    cliente_telefone,
    cliente_endereco,
    cliente_bairro,
    taxa_entrega,
    taxa_pagamento,
    subtotal,
    total,
    status,
    pago,
    tipo_pedido
) VALUES (
    'teste_sincronizacao_' || extract(epoch from now()),
    9999,
    '[
        {
            "nome": "Teste de Sincronização",
            "preco_unitario": 15.00,
            "quantidade": 1,
            "categoria": "Teste",
            "adicionais": []
        }
    ]'::jsonb,
    'DELIVERY',
    'Pedido de teste para verificar sincronização',
    'Dinheiro',
    'Cliente Teste',
    '(11) 77777-7777',
    'Rua Teste, 999',
    'Centro',
    5.00,
    0.00,
    15.00,
    20.00,
    'PENDENTE',
    false,
    'DELIVERY'
);

-- 10. Verificar se o pedido de teste foi inserido
SELECT 
    codigo,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
WHERE codigo = 9999;
