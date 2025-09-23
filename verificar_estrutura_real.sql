-- SQL para verificar a estrutura REAL da tabela pedidos_unificados
-- Execute este código no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM pg_tables
   WHERE  schemaname = 'public'
   AND    tablename  = 'pedidos_unificados'
) as tabela_existe;

-- 2. Mostrar TODAS as colunas da tabela
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

-- 4. Mostrar os últimos 5 pedidos (sem especificar colunas que podem não existir)
SELECT * FROM pedidos_unificados 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. Verificar se existe coluna 'origem'
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
AND column_name = 'origem';

-- 6. Verificar se existe coluna 'cliente_nome'
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'pedidos_unificados' 
AND column_name = 'cliente_nome';
