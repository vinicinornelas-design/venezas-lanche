-- Atualizar imagens específicas do cardápio
-- Usar as imagens gourmet que o usuário enviou

-- BATATAS FRITAS - usar imagens específicas
UPDATE itens_cardapio 
SET foto_url = '/batata-frita-mini.jpg' 
WHERE nome = 'BATATA FRITA (MINI)';

UPDATE itens_cardapio 
SET foto_url = '/batata-frita-media.jpg' 
WHERE nome = 'BATATA FRITA (MÉDIA)';

UPDATE itens_cardapio 
SET foto_url = '/batata-frita-grande.jpg' 
WHERE nome = 'BATATA FRITA (GRANDE)';

UPDATE itens_cardapio 
SET foto_url = '/batata-frita-extra-grande.jpg' 
WHERE nome = 'BATATA FRITA (EXTRA GRANDE)';

UPDATE itens_cardapio 
SET foto_url = '/batata-frita-mini-especial.jpg' 
WHERE nome = 'BATATA FRITA (MINI ESPECIAL)';

UPDATE itens_cardapio 
SET foto_url = '/batata-frita-master.jpg' 
WHERE nome = 'BATATA FRITA (MASTER)';

-- HAMBÚRGUERES GOURMET - usar imagens específicas
UPDATE itens_cardapio 
SET foto_url = '/burger-cremoso.jpg' 
WHERE nome = 'BURGER CREMOSO';

UPDATE itens_cardapio 
SET foto_url = '/burger-hawaii.jpg' 
WHERE nome = 'BURGER HAWAII';

UPDATE itens_cardapio 
SET foto_url = '/burger-triplo.jpg' 
WHERE nome = 'BURGER TRIPLO';

UPDATE itens_cardapio 
SET foto_url = '/burger-cheddar-sauce.jpg' 
WHERE nome = 'BURGER CHEDDAR SAUCE';

UPDATE itens_cardapio 
SET foto_url = '/burger-onion.jpg' 
WHERE nome = 'BURGER ONION';

UPDATE itens_cardapio 
SET foto_url = '/burger-pulled-beef.jpg' 
WHERE nome = 'BURGER PULLED BEEF';

UPDATE itens_cardapio 
SET foto_url = '/burger-egg.jpg' 
WHERE nome = 'BURGER EGG';

UPDATE itens_cardapio 
SET foto_url = '/burger-abacaxi.jpg' 
WHERE nome = 'BURGER ABACAXI';

-- OMELETES E CREPES - usar imagens específicas
UPDATE itens_cardapio 
SET foto_url = '/omelete-frango.jpg' 
WHERE nome = 'OMELETE DE FRANGO';

UPDATE itens_cardapio 
SET foto_url = '/crepes-recheados.jpg' 
WHERE nome = 'CREPES RECHEADOS';

-- Verificar se as imagens foram atualizadas
SELECT nome, foto_url, preco
FROM itens_cardapio 
WHERE foto_url LIKE '/burger-%' OR foto_url LIKE '/batata-frita-%' OR foto_url LIKE '/omelete-%' OR foto_url LIKE '/crepes-%'
ORDER BY nome;
