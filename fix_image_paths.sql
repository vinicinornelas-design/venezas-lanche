-- Corrigir caminhos das imagens no banco de dados
-- As imagens estão na pasta public, mas o banco tem caminhos incorretos

-- Atualizar caminhos das imagens existentes
UPDATE itens_cardapio 
SET foto_url = '/acai-bowl.jpg' 
WHERE foto_url = '/src/assets/acai-bowl.jpg';

UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE foto_url = '/src/assets/bacon-cheddar-burger.jpg';

UPDATE itens_cardapio 
SET foto_url = '/misto-sandwich.jpg' 
WHERE foto_url = '/src/assets/misto-sandwich.jpg';

UPDATE itens_cardapio 
SET foto_url = '/smash-burger.jpg' 
WHERE foto_url = '/src/assets/smash-burger.jpg';

UPDATE itens_cardapio 
SET foto_url = '/restaurant-banner.jpg' 
WHERE foto_url = '/src/assets/restaurant-banner.jpg';

-- Atualizar com as novas imagens gourmet
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

-- SMASH BURGUER
UPDATE itens_cardapio 
SET foto_url = '/smash-burger.jpg' 
WHERE nome IN (
    'SMASH CLÁSSICO', 
    'SMASH TRIPLO', 
    'SMASH SALADA', 
    'SMASH FRANGO', 
    'SMASH LINGUIÇA'
);

-- ARTESANAIS
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

-- TRADICIONAIS - MISTO
UPDATE itens_cardapio 
SET foto_url = '/misto-sandwich.jpg' 
WHERE nome IN ('MISTO', 'MISTO BACON', 'MISTO C/OVO');

-- TRADICIONAIS - HAMBÚRGUERES
UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome IN (
    'HAMBÚRGUER', 
    'BACON BURGUER', 
    'X BURGUER', 
    'X EGG', 
    'X EGG BACON', 
    'X FRANGO', 
    'X TUDO', 
    'X-BACON'
);

-- PÃO DE SAL
UPDATE itens_cardapio 
SET foto_url = '/misto-sandwich.jpg' 
WHERE nome IN (
    'PÃO C/ COSTELA', 
    'PÃO C/ COSTELA ESPECIAL', 
    'PÃO COM LINGUIÇA', 
    'X EGG BACON LIGUIÇA'
);

-- Adicionar novos itens se não existirem
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

INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'CREPES RECHEADOS', 12.00, id, 'Crepes finos recheados com queijo derretido, presunto e ervas frescas.', true, '/crepes-recheados.jpg'
FROM categorias 
WHERE nome = 'TRADICIONAIS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'CREPES RECHEADOS');

-- Verificar se as imagens foram atualizadas corretamente
SELECT nome, foto_url 
FROM itens_cardapio 
WHERE foto_url IS NOT NULL AND foto_url != ''
ORDER BY nome;
