-- Adicionar itens que têm imagens mas não estão no cardápio
-- Verificar se as categorias existem primeiro

-- Inserir categorias se não existirem
INSERT INTO categorias (nome, ativo, ordem) 
SELECT 'ACOMPANHAMENTOS', true, 6
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'ACOMPANHAMENTOS');

INSERT INTO categorias (nome, ativo, ordem) 
SELECT 'SOBREMESAS', true, 1
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'SOBREMESAS');

INSERT INTO categorias (nome, ativo, ordem) 
SELECT 'PROMOÇÃO', true, 2
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'PROMOÇÃO');

INSERT INTO categorias (nome, ativo, ordem) 
SELECT 'TRADICIONAIS', true, 3
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'TRADICIONAIS');

INSERT INTO categorias (nome, ativo, ordem) 
SELECT 'PÃO DE SAL', true, 4
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'PÃO DE SAL');

INSERT INTO categorias (nome, ativo, ordem) 
SELECT 'SMASH BURGUER', true, 5
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'SMASH BURGUER');

INSERT INTO categorias (nome, ativo, ordem) 
SELECT 'ARTESANAIS', true, 7
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'ARTESANAIS');

-- Adicionar itens com imagens que não estão no cardápio
-- Omeletes
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

-- Crepes
INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'CREPES RECHEADOS', 12.00, id, 'Crepes finos recheados com queijo derretido, presunto e ervas frescas.', true, '/crepes-recheados.jpg'
FROM categorias 
WHERE nome = 'TRADICIONAIS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'CREPES RECHEADOS');

-- Hambúrgueres gourmet com imagens específicas
INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'BURGER CREMOSO', 28.00, id, 'Hambúrguer artesanal com purê de batata, queijo derretido e bacon crocante.', true, '/burger-cremoso.jpg'
FROM categorias 
WHERE nome = 'ARTESANAIS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'BURGER CREMOSO');

INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'BURGER HAWAII', 32.00, id, 'Hambúrguer com abacaxi grelhado, bacon crocante e molho especial.', true, '/burger-hawaii.jpg'
FROM categorias 
WHERE nome = 'ARTESANAIS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'BURGER HAWAII');

INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'BURGER TRIPLO', 35.00, id, 'Hambúrguer triplo com três carnes, queijo derretido e ingredientes frescos.', true, '/burger-triplo.jpg'
FROM categorias 
WHERE nome = 'ARTESANAIS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'BURGER TRIPLO');

INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'BURGER CHEDDAR SAUCE', 30.00, id, 'Hambúrguer com molho de queijo cheddar cremoso e bacon.', true, '/burger-cheddar-sauce.jpg'
FROM categorias 
WHERE nome = 'ARTESANAIS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'BURGER CHEDDAR SAUCE');

INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'BURGER PULLED BEEF', 33.00, id, 'Hambúrguer com carne desfiada, queijo derretido e molho especial.', true, '/burger-pulled-beef.jpg'
FROM categorias 
WHERE nome = 'ARTESANAIS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'BURGER PULLED BEEF');

INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'BURGER ABACAXI', 31.00, id, 'Hambúrguer com abacaxi grelhado, bacon e molho especial.', true, '/burger-abacaxi.jpg'
FROM categorias 
WHERE nome = 'ARTESANAIS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'BURGER ABACAXI');

-- Verificar todos os itens adicionados
SELECT nome, preco, foto_url, categoria_id 
FROM itens_cardapio 
WHERE foto_url IS NOT NULL AND foto_url != ''
ORDER BY categoria_id, nome;
