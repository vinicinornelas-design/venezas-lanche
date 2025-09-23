-- Script para criar a tabela pedidos_unificados se não existir
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM pg_tables
   WHERE schemaname = 'public'
   AND tablename = 'pedidos_unificados'
) as tabela_existe;

-- 2. Criar a tabela se não existir
CREATE TABLE IF NOT EXISTS pedidos_unificados (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_pedido INTEGER NOT NULL,
    itens JSONB NOT NULL,
    origem VARCHAR(50) NOT NULL,
    metodo_pagamento VARCHAR(50),
    cliente_nome VARCHAR(255),
    cliente_telefone VARCHAR(20),
    cliente_endereco TEXT,
    cliente_bairro VARCHAR(100),
    mesa_numero INTEGER,
    mesa_etiqueta VARCHAR(50),
    funcionario_id UUID,
    funcionario_nome VARCHAR(255),
    taxa_entrega DECIMAL(10,2) DEFAULT 0.00,
    desconto DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    pago BOOLEAN DEFAULT FALSE,
    troco_para DECIMAL(10,2),
    valor_pago DECIMAL(10,2),
    observacoes TEXT,
    observacoes_cozinha TEXT,
    observacoes_entrega TEXT,
    tempo_preparo_estimado INTEGER,
    tempo_entrega_estimado INTEGER,
    iniciado_preparo_em TIMESTAMP WITH TIME ZONE,
    finalizado_preparo_em TIMESTAMP WITH TIME ZONE,
    entregue_em TIMESTAMP WITH TIME ZONE,
    avaliacao_nota INTEGER,
    avaliacao_comentario TEXT,
    avaliacao_em TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índice único para numero_pedido
CREATE UNIQUE INDEX IF NOT EXISTS idx_pedidos_unificados_numero_pedido 
ON pedidos_unificados(numero_pedido);

-- 4. Criar índice para status
CREATE INDEX IF NOT EXISTS idx_pedidos_unificados_status 
ON pedidos_unificados(status);

-- 5. Criar índice para created_at
CREATE INDEX IF NOT EXISTS idx_pedidos_unificados_created_at 
ON pedidos_unificados(created_at);

-- 6. Habilitar publicação para Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos_unificados;

-- 7. Desabilitar RLS temporariamente para testes
ALTER TABLE pedidos_unificados DISABLE ROW LEVEL SECURITY;

-- 8. Conceder permissões
GRANT ALL ON pedidos_unificados TO anon;
GRANT ALL ON pedidos_unificados TO authenticated;

-- 9. Inserir pedido de teste
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
    10003,
    '[
        {
            "nome": "Teste Criação Tabela",
            "categoria": "TRADICIONAIS",
            "adicionais": [],
            "quantidade": 1,
            "preco_unitario": 40
        }
    ]'::jsonb,
    'DELIVERY',
    'pix',
    'Cliente Teste Criação',
    '(11) 33333-3333',
    'Rua Teste Criação, 789',
    'Centro',
    '5.00',
    '0.00',
    '40.00',
    '45.00',
    'PENDENTE',
    false
);

-- 10. Verificar se o pedido foi inserido
SELECT 
    numero_pedido,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
WHERE numero_pedido = 10003;

-- 11. Verificar se a tabela está na publicação
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'pedidos_unificados';
