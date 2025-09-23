-- Script para corrigir permissões da tabela pedidos_unificados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar RLS atual
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'pedidos_unificados';

-- 2. Verificar políticas existentes
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pedidos_unificados';

-- 3. Desabilitar RLS temporariamente para permitir inserção
ALTER TABLE pedidos_unificados DISABLE ROW LEVEL SECURITY;

-- 4. Verificar se RLS foi desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'pedidos_unificados';

-- 5. Conceder permissões explícitas
GRANT INSERT ON pedidos_unificados TO anon;
GRANT INSERT ON pedidos_unificados TO authenticated;
GRANT SELECT ON pedidos_unificados TO anon;
GRANT SELECT ON pedidos_unificados TO authenticated;

-- 6. Verificar permissões
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'pedidos_unificados';

-- 7. Testar inserção com usuário anônimo (simular cardápio público)
-- Isso vai simular o que acontece quando o cardápio público tenta inserir
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
    9996,
    '[
        {
            "nome": "Teste Cardápio Público",
            "categoria": "TRADICIONAIS",
            "adicionais": [],
            "quantidade": 1,
            "preco_unitario": 20
        }
    ]'::jsonb,
    'DELIVERY',
    'dinheiro',
    'Cliente Cardápio',
    '(11) 88888-8888',
    'Rua Cardápio, 456',
    'Centro',
    '5.00',
    '0.00',
    '20.00',
    '25.00',
    'PENDENTE',
    false
);

-- 8. Verificar se foi inserido
SELECT 
    numero_pedido,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
WHERE numero_pedido = 9996;

-- 9. Verificar últimos pedidos
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
