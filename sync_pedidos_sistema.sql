-- Script para sincronizar pedidos do cardápio público com o sistema de gestão
-- Execute este script no Supabase SQL Editor

-- Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
ORDER BY ordinal_position;

-- Verificar pedidos existentes
SELECT COUNT(*) as total_pedidos FROM pedidos_unificados;
SELECT * FROM pedidos_unificados ORDER BY created_at DESC LIMIT 5;

-- Criar tabela com estrutura completa compatível com o sistema de gestão
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

-- Desabilitar RLS temporariamente
ALTER TABLE pedidos_unificados DISABLE ROW LEVEL SECURITY;

-- Criar índices para performance
CREATE INDEX idx_pedidos_codigo ON pedidos_unificados(codigo);
CREATE INDEX idx_pedidos_status ON pedidos_unificados(status);
CREATE INDEX idx_pedidos_created_at ON pedidos_unificados(created_at);
CREATE INDEX idx_pedidos_cliente ON pedidos_unificados(cliente_nome);

-- Inserir pedido de teste do cardápio público
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
    'cardapio_publico_' || extract(epoch from now()),
    999, -- Código de teste
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
        }
    ]'::jsonb,
    'DELIVERY',
    'Pedido feito pelo cardápio público',
    'Dinheiro',
    'João Silva',
    '(11) 99999-9999',
    'Rua das Flores, 123',
    'Centro',
    5.00,
    0.00,
    32.00,
    37.00,
    'PENDENTE',
    false,
    'DELIVERY'
);

-- Verificar se o pedido foi inserido
SELECT 
    codigo,
    cliente_nome,
    cliente_telefone,
    total,
    status,
    origem,
    created_at
FROM pedidos_unificados 
ORDER BY created_at DESC 
LIMIT 3;

-- Verificar estrutura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
ORDER BY ordinal_position;
