-- Atualizar cardápio com imagens corretas baseadas nos nomes dos arquivos
-- Baseado nas imagens disponíveis: acai-bowl.jpg, bacon-cheddar-burger.jpg, misto-sandwich.jpg, smash-burger.jpg

-- SOBREMESAS
UPDATE itens_cardapio 
SET foto_url = '/src/assets/acai-bowl.jpg' 
WHERE nome = 'AÇAI NO COPO';

UPDATE itens_cardapio 
SET foto_url = '/src/assets/restaurant-banner.jpg' 
WHERE nome = 'CHOCOLATE';

-- PROMOÇÃO
UPDATE itens_cardapio 
SET foto_url = '/src/assets/bacon-cheddar-burger.jpg' 
WHERE nome = 'HAMBUGUER + AÇAI';

-- TRADICIONAIS - MISTO
UPDATE itens_cardapio 
SET foto_url = '/src/assets/misto-sandwich.jpg' 
WHERE nome IN ('MISTO', 'MISTO BACON', 'MISTO C/OVO');

-- TRADICIONAIS - HAMBÚRGUERES
UPDATE itens_cardapio 
SET foto_url = '/src/assets/bacon-cheddar-burger.jpg' 
WHERE nome IN (
    'HAMBÚRGUER', 
    'BACON BURGUER', 
    'BACON CHEDDAR', 
    'X BURGUER', 
    'X CABULOSO', 
    'X CAPRICHADO', 
    'X EGG', 
    'X EGG BACON', 
    'X FRANGO', 
    'X TUDO', 
    'X-BACON', 
    'VULCÃO BURGUER', 
    'X TORNADO', 
    'X TERREMOTO'
);

-- PÃO DE SAL
UPDATE itens_cardapio 
SET foto_url = '/src/assets/misto-sandwich.jpg' 
WHERE nome IN (
    'PÃO C/ COSTELA', 
    'PÃO C/ COSTELA ESPECIAL', 
    'PÃO COM LINGUIÇA', 
    'X EGG BACON LIGUIÇA'
);

-- SMASH BURGUER
UPDATE itens_cardapio 
SET foto_url = '/src/assets/smash-burger.jpg' 
WHERE nome IN (
    'SMASH CLÁSSICO', 
    'SMASH TRIPLO', 
    'SMASH SALADA', 
    'SMASH FRANGO', 
    'SMASH LINGUIÇA'
);

-- ARTESANAIS
UPDATE itens_cardapio 
SET foto_url = '/src/assets/bacon-cheddar-burger.jpg' 
WHERE nome IN (
    'BIG BUGUER', 
    'BUGUER CREMOSO', 
    'BUGUER PICANTE', 
    'BUGUER VIP', 
    'BURGUER BACON ARTESANAL', 
    'PISCINA DE CHEDDAR', 
    'RIBS BUGUER', 
    'X FURACÃO', 
    'X TSUNAMI', 
    'X TUDO ARTESANAL'
);
