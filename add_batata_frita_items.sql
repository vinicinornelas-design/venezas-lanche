-- Adicionar itens de batata frita ao cardápio
-- Criar categoria ACOMPANHAMENTOS se não existir

INSERT INTO categorias (nome, ativo, ordem) 
SELECT 'ACOMPANHAMENTOS', true, 6
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'ACOMPANHAMENTOS');

-- Adicionar itens de batata frita
INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'BATATA FRITA (MINI)', 8.00, id, 'Porção pequena de batatas fritas crocantes e douradas.', true, '/batata-frita-mini.jpg'
FROM categorias 
WHERE nome = 'ACOMPANHAMENTOS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'BATATA FRITA (MINI)');

INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'BATATA FRITA (MÉDIA)', 12.00, id, 'Porção média de batatas fritas crocantes e douradas.', true, '/batata-frita-media.jpg'
FROM categorias 
WHERE nome = 'ACOMPANHAMENTOS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'BATATA FRITA (MÉDIA)');

INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'BATATA FRITA (GRANDE)', 16.00, id, 'Porção grande de batatas fritas crocantes e douradas.', true, '/batata-frita-grande.jpg'
FROM categorias 
WHERE nome = 'ACOMPANHAMENTOS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'BATATA FRITA (GRANDE)');

INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'BATATA FRITA (EXTRA GRANDE)', 20.00, id, 'Porção extra grande de batatas fritas crocantes e douradas.', true, '/batata-frita-extra-grande.jpg'
FROM categorias 
WHERE nome = 'ACOMPANHAMENTOS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'BATATA FRITA (EXTRA GRANDE)');

INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'BATATA FRITA (MINI ESPECIAL)', 15.00, id, 'Porção pequena de batatas fritas com queijo derretido e bacon crocante.', true, '/batata-frita-mini-especial.jpg'
FROM categorias 
WHERE nome = 'ACOMPANHAMENTOS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'BATATA FRITA (MINI ESPECIAL)');

INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) 
SELECT 'BATATA FRITA (MASTER)', 25.00, id, 'Porção master de batatas fritas carregadas com queijo derretido, bacon crocante e molho especial.', true, '/batata-frita-master.jpg'
FROM categorias 
WHERE nome = 'ACOMPANHAMENTOS' 
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'BATATA FRITA (MASTER)');

-- Verificar se os itens foram adicionados
SELECT nome, preco, foto_url, categoria_id 
FROM itens_cardapio 
WHERE nome LIKE 'BATATA FRITA%'
ORDER BY preco;
