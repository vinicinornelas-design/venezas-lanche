-- Script simples para criar tabela de pedidos
-- Execute este script no Supabase SQL Editor

-- Remover tabela se existir (cuidado!)
DROP TABLE IF EXISTS pedidos_unificados CASCADE;

-- Criar tabela simples
CREATE TABLE pedidos_unificados (
    id TEXT PRIMARY KEY,
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Desabilitar RLS temporariamente para testes
ALTER TABLE pedidos_unificados DISABLE ROW LEVEL SECURITY;

-- Inserir pedido de teste
INSERT INTO pedidos_unificados (
    id,
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
    status
) VALUES (
    'teste_001',
    '[{"nome": "Hambúrguer", "preco_unitario": 20.00, "quantidade": 1, "categoria": "Lanches", "adicionais": []}]'::jsonb,
    'DELIVERY',
    'Pedido de teste',
    'Dinheiro',
    'Cliente Teste',
    '(11) 99999-9999',
    'Rua Teste, 123',
    'Centro',
    5.00,
    0.00,
    20.00,
    25.00,
    'PENDENTE'
);

-- Verificar se funcionou
SELECT * FROM pedidos_unificados;
