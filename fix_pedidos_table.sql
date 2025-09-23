-- Script para corrigir definitivamente a tabela de pedidos
-- Execute este script no Supabase SQL Editor

-- Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM pg_tables
   WHERE  schemaname = 'public'
   AND    tablename  = 'pedidos_unificados'
);

-- Remover tabela se existir (cuidado!)
DROP TABLE IF EXISTS pedidos_unificados CASCADE;

-- Criar tabela com estrutura correta
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

-- Desabilitar RLS temporariamente
ALTER TABLE pedidos_unificados DISABLE ROW LEVEL SECURITY;

-- Criar índice para melhor performance
CREATE INDEX idx_pedidos_created_at ON pedidos_unificados(created_at);
CREATE INDEX idx_pedidos_status ON pedidos_unificados(status);

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
    'teste_' || extract(epoch from now()),
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
SELECT COUNT(*) as total_pedidos FROM pedidos_unificados;
SELECT * FROM pedidos_unificados ORDER BY created_at DESC LIMIT 1;

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
ORDER BY ordinal_position;
