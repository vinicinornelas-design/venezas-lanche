-- Script para verificar permissões da tabela pedidos_unificados
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables 
WHERE tablename = 'pedidos_unificados';

-- 2. Verificar políticas RLS
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'pedidos_unificados';

-- 3. Verificar permissões da tabela
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'pedidos_unificados';

-- 4. Verificar se usuário anônimo tem permissão
SELECT 
    has_table_privilege('anon', 'pedidos_unificados', 'INSERT') as anon_pode_inserir,
    has_table_privilege('anon', 'pedidos_unificados', 'SELECT') as anon_pode_ler,
    has_table_privilege('authenticated', 'pedidos_unificados', 'INSERT') as auth_pode_inserir,
    has_table_privilege('authenticated', 'pedidos_unificados', 'SELECT') as auth_pode_ler;

-- 5. Desabilitar RLS temporariamente (se necessário)
-- ALTER TABLE pedidos_unificados DISABLE ROW LEVEL SECURITY;

-- 6. Criar política permissiva (se necessário)
-- CREATE POLICY "Permitir inserção para todos" ON pedidos_unificados
--     FOR INSERT WITH CHECK (true);

-- 7. Verificar se há constraints que podem estar bloqueando
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    consrc as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'pedidos_unificados'::regclass;
