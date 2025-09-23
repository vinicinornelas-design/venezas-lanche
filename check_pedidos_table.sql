-- Script para verificar e corrigir a tabela pedidos_unificados
-- Execute este script no Supabase SQL Editor

-- Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM pg_tables
   WHERE  schemaname = 'public'
   AND    tablename  = 'pedidos_unificados'
);

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'pedidos_unificados'
ORDER BY ordinal_position;

-- Criar tabela se não existir
CREATE TABLE IF NOT EXISTS pedidos_unificados (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    itens JSONB NOT NULL,
    origem VARCHAR(50) DEFAULT 'DELIVERY',
    observacoes TEXT DEFAULT '',
    metodo_pagamento VARCHAR(100) NOT NULL,
    cliente_nome VARCHAR(255) NOT NULL,
    cliente_telefone VARCHAR(20) NOT NULL,
    cliente_endereco TEXT NOT NULL,
    cliente_bairro VARCHAR(100) NOT NULL,
    taxa_entrega DECIMAL(10,2) DEFAULT 0.00,
    taxa_pagamento DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'PENDENTE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE pedidos_unificados ENABLE ROW LEVEL SECURITY;

-- Criar políticas de segurança
CREATE POLICY "pedidos_select_policy" ON pedidos_unificados
    FOR SELECT USING (true);

CREATE POLICY "pedidos_insert_policy" ON pedidos_unificados
    FOR INSERT WITH CHECK (true);

CREATE POLICY "pedidos_update_policy" ON pedidos_unificados
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "pedidos_delete_policy" ON pedidos_unificados
    FOR DELETE USING (auth.role() = 'authenticated');

-- Verificar se as políticas foram criadas
SELECT policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'pedidos_unificados';

-- Testar inserção de um pedido de exemplo
INSERT INTO pedidos_unificados (
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
    '[{"nome": "Hambúrguer", "preco_unitario": 20.00, "quantidade": 1, "categoria": "Lanches", "adicionais": []}]'::jsonb,
    'DELIVERY',
    'Teste de pedido',
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

-- Verificar se o pedido foi inserido
SELECT * FROM pedidos_unificados ORDER BY created_at DESC LIMIT 1;
