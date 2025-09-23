-- SQL para verificar se existe tabela de pedidos
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se a tabela pedidos_unificados existe
SELECT EXISTS (
   SELECT FROM pg_tables
   WHERE  schemaname = 'public'
   AND    tablename  = 'pedidos_unificados'
) as tabela_existe;

-- 2. Se existir, mostrar a estrutura da tabela
SELECT 
    column_name as coluna,
    data_type as tipo_dados,
    is_nullable as pode_null,
    column_default as valor_padrao
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
ORDER BY ordinal_position;

-- 3. Contar quantos pedidos existem
SELECT COUNT(*) as total_pedidos FROM pedidos_unificados;

-- 4. Mostrar os últimos 5 pedidos
SELECT 
    id,
    codigo,
    cliente_nome,
    origem,
    total,
    status,
    created_at
FROM pedidos_unificados 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar pedidos por origem
SELECT 
    origem,
    COUNT(*) as quantidade
FROM pedidos_unificados 
GROUP BY origem;
