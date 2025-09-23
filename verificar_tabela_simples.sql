-- SQL SIMPLES para verificar tabela de pedidos
-- Execute APENAS este código no Supabase SQL Editor

-- Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM pg_tables
   WHERE  schemaname = 'public'
   AND    tablename  = 'pedidos_unificados'
) as tabela_existe;

-- Mostrar estrutura da tabela
SELECT 
    column_name as coluna,
    data_type as tipo_dados,
    is_nullable as pode_null
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
ORDER BY ordinal_position;

-- Contar pedidos
SELECT COUNT(*) as total_pedidos FROM pedidos_unificados;

-- Últimos pedidos
SELECT 
    codigo,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
ORDER BY created_at DESC 
LIMIT 5;
