-- Remover restrições de imagem do cardápio
-- Este SQL remove as constraints e validações que podem estar limitando o upload de imagens

-- 1. Remover constraints de NOT NULL na coluna foto_url se existir
ALTER TABLE itens_cardapio ALTER COLUMN foto_url DROP NOT NULL;

-- 2. Remover índices relacionados a foto_url se existirem
DROP INDEX IF EXISTS idx_itens_cardapio_foto;

-- 3. Remover validações de URL se existirem (check constraints)
-- Primeiro, vamos verificar se existem constraints de validação
DO $$ 
BEGIN
    -- Remover constraint de validação de URL se existir
    IF EXISTS (
        SELECT 1 FROM information_schema.check_constraints cc
        JOIN information_schema.table_constraints tc ON cc.constraint_name = tc.constraint_name
        WHERE cc.constraint_name LIKE '%foto_url%' 
        AND tc.table_name = 'itens_cardapio'
    ) THEN
        ALTER TABLE itens_cardapio DROP CONSTRAINT IF EXISTS check_foto_url_format;
    END IF;
END $$;

-- 4. Permitir valores vazios e nulos na coluna foto_url
UPDATE itens_cardapio 
SET foto_url = NULL 
WHERE foto_url = '' OR foto_url IS NULL;

-- 5. Adicionar comentário explicativo na coluna
COMMENT ON COLUMN itens_cardapio.foto_url IS 'URL da imagem do item do cardápio. Pode ser NULL ou vazio.';

-- 6. Verificar se a coluna permite NULL (deve ser true após as alterações)
SELECT 
    column_name, 
    is_nullable, 
    data_type, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'itens_cardapio' 
AND column_name = 'foto_url';
