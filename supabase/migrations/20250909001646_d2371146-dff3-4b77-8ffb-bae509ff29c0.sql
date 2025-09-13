-- Adicionar mais itens variados ao cardápio
-- Primeiro, vamos adicionar as novas categorias
INSERT INTO categorias (nome, ativo, ordem) 
SELECT 'BEBIDAS QUENTES', true, 8
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'BEBIDAS QUENTES');

INSERT INTO categorias (nome, ativo, ordem) 
SELECT 'AÇAÍ E SOBREMESAS', true, 9
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'AÇAÍ E SOBREMESAS');

INSERT INTO categorias (nome, ativo, ordem) 
SELECT 'PORÇÕES', true, 10
WHERE NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'PORÇÕES');

-- Adicionar itens de lanches variados
INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo, foto_url)
SELECT 
  'X-Salada Completo', 
  16.50, 
  'Hambúrguer bovino, alface, tomate, queijo, presunto, ovo e batata palha', 
  c.id, 
  true,
  '/src/assets/misto-sandwich.jpg'
FROM categorias c 
WHERE c.nome = 'TRADICIONAIS'
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'X-Salada Completo');

INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo, foto_url)
SELECT 
  'X-Frango Especial', 
  19.00, 
  'Peito de frango grelhado, queijo, alface, tomate e maionese especial', 
  c.id, 
  true,
  '/src/assets/bacon-cheddar-burger.jpg'
FROM categorias c 
WHERE c.nome = 'TRADICIONAIS'
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'X-Frango Especial');

INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo, foto_url)
SELECT 
  'Duplo Smash Bacon', 
  28.00, 
  '2 Hambúrgueres smash 120g, queijo cheddar, bacon crocante e molho especial', 
  c.id, 
  true,
  '/src/assets/smash-burger.jpg'
FROM categorias c 
WHERE c.nome = 'SMASH BURGUER'
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'Duplo Smash Bacon');

-- Adicionar mais bebidas
INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo)
SELECT 
  'Refrigerante Lata', 
  4.50, 
  'Coca-Cola, Pepsi, Guaraná, Fanta - 350ml', 
  c.id, 
  true
FROM categorias c 
WHERE c.nome = 'Bebidas'
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'Refrigerante Lata');

INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo)
SELECT 
  'Suco Natural', 
  7.00, 
  'Laranja, Limão, Acerola ou Maracujá - 300ml', 
  c.id, 
  true
FROM categorias c 
WHERE c.nome = 'Bebidas'
AND NOT EXISTS (SELECT 1 FROM itens_cardapio WHERE nome = 'Suco Natural');