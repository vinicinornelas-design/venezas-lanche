-- Atualizar TODOS os itens do cardápio com imagens que funcionam
-- Usar apenas imagens que existem na pasta public

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

-- HAMBÚRGUERES TRADICIONAIS - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome IN (
    'HAMBÚRGUER', 
    'BACON BURGUER', 
    'X BURGUER', 
    'X TUDO', 
    'X-BACON',
    'X EGG',
    'X EGG BACON',
    'X FRANGO'
);

-- BATATAS FRITAS - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/smash-burger.jpg' 
WHERE nome LIKE 'BATATA FRITA%';

-- OMELETES E CREPES - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome IN ('OMELETE DE FRANGO', 'OMELETE ESPECIAL');

UPDATE itens_cardapio 
SET foto_url = '/misto-sandwich.jpg' 
WHERE nome = 'CREPES RECHEADOS';

-- BURGERS ARTESANAIS - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome LIKE 'BURGER%';

-- SMASH BURGUER - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/smash-burger.jpg' 
WHERE nome LIKE 'SMASH%';

-- PÃO DE SAL - usar imagem que existe
UPDATE itens_cardapio 
SET foto_url = '/misto-sandwich.jpg' 
WHERE nome LIKE 'PÃO%';

-- Verificar resultado final
SELECT nome, foto_url, categoria_id 
FROM itens_cardapio 
WHERE foto_url IS NOT NULL 
ORDER BY categoria_id, nome;
