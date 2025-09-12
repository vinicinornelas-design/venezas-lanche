-- SOLUÇÃO FINAL: Corrigir imagens do cardápio
-- Usando apenas as imagens que existem na pasta public

-- Limpar todas as URLs de imagem primeiro
UPDATE itens_cardapio SET foto_url = NULL;

-- AÇAI NO COPO - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/acai-bowl.jpg' 
WHERE nome = 'AÇAI NO COPO';

-- BACON CHEDDAR - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'BACON CHEDDAR';

-- MISTO - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/misto-sandwich.jpg' 
WHERE nome = 'MISTO';

-- SMASH CLÁSSICO - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/smash-burger.jpg' 
WHERE nome = 'SMASH CLÁSSICO';

-- HAMBÚRGUER - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'HAMBÚRGUER';

-- BACON BURGUER - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'BACON BURGUER';

-- X BURGUER - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'X BURGUER';

-- X TUDO - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'X TUDO';

-- X-BACON - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'X-BACON';

-- Verificar resultado
SELECT nome, foto_url 
FROM itens_cardapio 
WHERE foto_url IS NOT NULL 
ORDER BY nome;
