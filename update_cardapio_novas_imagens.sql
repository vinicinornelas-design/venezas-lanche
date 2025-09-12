-- Atualizar cardápio com as novas imagens da pasta public
-- Baseado nas imagens gourmet enviadas pelo usuário

-- TRADICIONAIS - Hambúrgueres com bacon e queijo
UPDATE itens_cardapio 
SET foto_url = '/burger-cheddar-sauce.jpg' 
WHERE nome = 'BACON CHEDDAR';

UPDATE itens_cardapio 
SET foto_url = '/burger-cremoso.jpg' 
WHERE nome = 'BUGUER CREMOSO';

UPDATE itens_cardapio 
SET foto_url = '/burger-hawaii.jpg' 
WHERE nome = 'X CABULOSO';

UPDATE itens_cardapio 
SET foto_url = '/burger-triplo.jpg' 
WHERE nome = 'X TORNADO';

UPDATE itens_cardapio 
SET foto_url = '/burger-pulled-beef.jpg' 
WHERE nome = 'X CAPRICHADO';

UPDATE itens_cardapio 
SET foto_url = '/burger-abacaxi.jpg' 
WHERE nome = 'VULCÃO BURGUER';

-- SMASH BURGUER - Atualizar com imagem gourmet
UPDATE itens_cardapio 
SET foto_url = '/smash-burger.jpg' 
WHERE nome IN (
    'SMASH CLÁSSICO', 
    'SMASH TRIPLO', 
    'SMASH SALADA', 
    'SMASH FRANGO', 
    'SMASH LINGUIÇA'
);

-- ARTESANAIS - Hambúrgueres gourmet
UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome IN (
    'BIG BUGUER', 
    'BUGUER VIP', 
    'BURGUER BACON ARTESANAL', 
    'PISCINA DE CHEDDAR', 
    'RIBS BUGUER', 
    'X FURACÃO', 
    'X TSUNAMI', 
    'X TUDO ARTESANAL'
);

-- Adicionar novos itens do cardápio baseados nas imagens
-- Omeletes (verificar se existem antes de inserir)
INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'OMELETE DE FRANGO', 15.00, id, 'Omelete recheado com frango grelhado, queijo derretido e vegetais frescos.', true, '/omelete-frango.jpg'
FROM categorias 
WHERE nome = 'TRADICIONAIS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'OMELETE DE FRANGO');

INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'OMELETE ESPECIAL', 18.00, id, 'Omelete recheado com bacon, queijo, tomate e ervas frescas.', true, '/omelete-especial.jpg'
FROM categorias 
WHERE nome = 'TRADICIONAIS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'OMELETE ESPECIAL');

-- Crepes (verificar se existem antes de inserir)
INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'CREPES RECHEADOS', 12.00, id, 'Crepes finos recheados com queijo derretido, presunto e ervas frescas.', true, '/crepes-recheados.jpg'
FROM categorias 
WHERE nome = 'TRADICIONAIS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'CREPES RECHEADOS');

-- Verificar se as imagens foram atualizadas corretamente
SELECT nome, foto_url, categoria_id 
FROM itens_cardapio 
WHERE foto_url LIKE '/burger-%' OR foto_url LIKE '/omelete-%' OR foto_url LIKE '/crepes-%'
ORDER BY nome;
