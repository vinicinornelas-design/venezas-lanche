-- Verificar se a tabela opcionais existe e tem dados
-- Execute este script no Supabase SQL Editor

-- Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'opcionais'
) as tabela_existe;

-- Contar registros na tabela
SELECT COUNT(*) as total_registros FROM opcionais;

-- Ver alguns registros de exemplo
SELECT * FROM opcionais LIMIT 5;

-- Verificar se há adicionais para itens específicos
SELECT 
    o.nome as adicional,
    o.preco_extra,
    i.nome as item_cardapio
FROM opcionais o
LEFT JOIN itens_cardapio i ON o.item_id = i.id
LIMIT 10;
