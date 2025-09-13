-- Script para habilitar Realtime no Supabase

-- 1. Habilitar Realtime para a tabela notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- 2. Habilitar Realtime para a tabela pedidos_unificados
ALTER PUBLICATION supabase_realtime ADD TABLE pedidos_unificados;

-- 3. Habilitar Realtime para a tabela mesas
ALTER PUBLICATION supabase_realtime ADD TABLE mesas;

-- 4. Verificar se as tabelas estão na publicação
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('notifications', 'pedidos_unificados', 'mesas');

-- 5. Verificar se o Realtime está habilitado
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';
