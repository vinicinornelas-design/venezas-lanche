-- Corrigir imagens dos itens de batata frita
-- Usar imagens que já existem e funcionam

-- Atualizar itens de batata frita para usar imagens existentes
UPDATE itens_cardapio 
SET foto_url = '/smash-burger.jpg' 
WHERE nome = 'BATATA FRITA (MINI)';

UPDATE itens_cardapio 
SET foto_url = '/smash-burger.jpg' 
WHERE nome = 'BATATA FRITA (MÉDIA)';

UPDATE itens_cardapio 
SET foto_url = '/smash-burger.jpg' 
WHERE nome = 'BATATA FRITA (GRANDE)';

UPDATE itens_cardapio 
SET foto_url = '/smash-burger.jpg' 
WHERE nome = 'BATATA FRITA (EXTRA GRANDE)';

UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'BATATA FRITA (MINI ESPECIAL)';

UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'BATATA FRITA (MASTER)';

-- Atualizar outros itens para usar imagens existentes
UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'OMELETE DE FRANGO';

UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'OMELETE ESPECIAL';

UPDATE itens_cardapio 
SET foto_url = '/misto-sandwich.jpg' 
WHERE nome = 'CREPES RECHEADOS';

UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'BURGER CREMOSO';

UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'BURGER HAWAII';

UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'BURGER TRIPLO';

UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'BURGER CHEDDAR SAUCE';

UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'BURGER PULLED BEEF';

UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'BURGER ABACAXI';

-- Verificar se as imagens foram atualizadas
SELECT nome, foto_url 
FROM itens_cardapio 
WHERE nome LIKE 'BATATA FRITA%' OR nome LIKE 'BURGER%' OR nome LIKE 'OMELETE%' OR nome LIKE 'CREPES%'
ORDER BY nome;
