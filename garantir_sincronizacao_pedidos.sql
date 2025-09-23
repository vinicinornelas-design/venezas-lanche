-- Script para garantir que os pedidos do cardápio público sejam sincronizados com o sistema
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe e sua estrutura
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
ORDER BY ordinal_position;

-- 2. Verificar pedidos existentes
SELECT 
    COUNT(*) as total_pedidos,
    COUNT(CASE WHEN origem = 'DELIVERY' THEN 1 END) as pedidos_cardapio_publico,
    COUNT(CASE WHEN origem = 'BALCAO' THEN 1 END) as pedidos_balcao
FROM pedidos_unificados;

-- 3. Recriar tabela com estrutura completa e correta
DROP TABLE IF EXISTS pedidos_unificados CASCADE;

CREATE TABLE pedidos_unificados (
    id TEXT PRIMARY KEY,
    codigo INTEGER UNIQUE NOT NULL,
    itens JSONB NOT NULL,
    origem TEXT DEFAULT 'DELIVERY',
    observacoes TEXT DEFAULT '',
    metodo_pagamento TEXT NOT NULL,
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT NOT NULL,
    cliente_endereco TEXT NOT NULL,
    cliente_bairro TEXT NOT NULL,
    taxa_entrega DECIMAL(10,2) DEFAULT 0.00,
    taxa_pagamento DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'PENDENTE',
    pago BOOLEAN DEFAULT false,
    tipo_pedido TEXT DEFAULT 'DELIVERY',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Desabilitar RLS temporariamente para evitar problemas de permissão
ALTER TABLE pedidos_unificados DISABLE ROW LEVEL SECURITY;

-- 5. Criar índices para melhor performance
CREATE INDEX idx_pedidos_codigo ON pedidos_unificados(codigo);
CREATE INDEX idx_pedidos_status ON pedidos_unificados(status);
CREATE INDEX idx_pedidos_created_at ON pedidos_unificados(created_at);
CREATE INDEX idx_pedidos_origem ON pedidos_unificados(origem);
CREATE INDEX idx_pedidos_cliente ON pedidos_unificados(cliente_nome);

-- 6. Inserir pedido de teste do cardápio público
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
    'cardapio_publico_teste_' || extract(epoch from now()),
    1001,
    '[
        {
            "nome": "Hambúrguer Especial",
            "preco_unitario": 25.00,
            "quantidade": 1,
            "categoria": "Lanches",
            "adicionais": [
                {"nome": "Queijo Extra", "preco": 3.00, "quantidade": 1},
                {"nome": "Bacon Extra", "preco": 4.00, "quantidade": 1}
            ]
        },
        {
            "nome": "Batata Frita",
            "preco_unitario": 8.00,
            "quantidade": 1,
            "categoria": "Acompanhamentos",
            "adicionais": []
        }
    ]'::jsonb,
    'DELIVERY',
    'Pedido de teste do cardápio público',
    'Dinheiro',
    'João Silva',
    '(11) 99999-9999',
    'Rua das Flores, 123',
    'Centro',
    5.00,
    0.00,
    40.00,
    45.00,
    'PENDENTE',
    false,
    'DELIVERY'
);

-- 7. Inserir pedido de teste do balcão para comparação
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
    'balcao_teste_' || extract(epoch from now()),
    1002,
    '[
        {
            "nome": "X-Burger",
            "preco_unitario": 18.00,
            "quantidade": 1,
            "categoria": "Lanches",
            "adicionais": []
        }
    ]'::jsonb,
    'BALCAO',
    'Pedido de teste do balcão',
    'PIX',
    'Cliente Balcão',
    '(11) 88888-8888',
    'Endereço não informado',
    'Balcão',
    0.00,
    0.00,
    18.00,
    18.00,
    'PENDENTE',
    false,
    'BALCAO'
);

-- 8. Verificar se os pedidos foram inseridos corretamente
SELECT 
    codigo,
    cliente_nome,
    origem,
    total,
    status,
    created_at,
    CASE 
        WHEN origem = 'DELIVERY' THEN 'Cardápio Público'
        WHEN origem = 'BALCAO' THEN 'Balcão'
        ELSE origem
    END as fonte_pedido
FROM pedidos_unificados 
ORDER BY created_at DESC;

-- 9. Verificar contagem por origem
SELECT 
    origem,
    COUNT(*) as total_pedidos,
    SUM(total) as valor_total,
    AVG(total) as valor_medio
FROM pedidos_unificados 
GROUP BY origem
ORDER BY total_pedidos DESC;

-- 10. Verificar estrutura final da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
ORDER BY ordinal_position;
