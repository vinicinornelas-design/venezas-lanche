-- Verificar RLS atual
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'pedidos_unificados';

-- Verificar políticas existentes
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pedidos_unificados';

-- Desabilitar RLS temporariamente
ALTER TABLE pedidos_unificados DISABLE ROW LEVEL SECURITY;

-- Verificar se RLS foi desabilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'pedidos_unificados';

-- Conceder permissões explícitas
GRANT INSERT ON pedidos_unificados TO anon;
GRANT INSERT ON pedidos_unificados TO authenticated;
GRANT SELECT ON pedidos_unificados TO anon;
GRANT SELECT ON pedidos_unificados TO authenticated;

-- Verificar permissões
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'pedidos_unificados';

-- Testar inserção
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

-- Verificar se foi inserido
SELECT 
    numero_pedido,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
WHERE numero_pedido = 9996;

-- Verificar últimos pedidos
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
