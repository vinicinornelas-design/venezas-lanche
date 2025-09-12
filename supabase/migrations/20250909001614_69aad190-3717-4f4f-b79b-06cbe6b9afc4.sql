-- Adicionar mais itens variados ao cardápio para completar o menu
INSERT INTO categorias (nome, ativo, ordem) VALUES 
('BEBIDAS QUENTES', true, 8),
('AÇAÍ E SOBREMESAS', true, 9),
('PORÇÕES', true, 10)
ON CONFLICT (nome) DO NOTHING;

-- Adicionar itens de lanches variados
INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo, foto_url)
SELECT 
  'X-Salada Completo', 
  16.50, 
  'Hambúrguer bovino, alface, tomate, queijo, presunto, ovo e batata palha', 
  c.id, 
  true,
  '/src/assets/misto-sandwich.jpg'
FROM categorias c WHERE c.nome = 'TRADICIONAIS'
ON CONFLICT DO NOTHING;

INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo, foto_url)
SELECT 
  'X-Frango Especial', 
  19.00, 
  'Peito de frango grelhado, queijo, alface, tomate e maionese especial', 
  c.id, 
  true,
  '/src/assets/bacon-cheddar-burger.jpg'
FROM categorias c WHERE c.nome = 'TRADICIONAIS'
ON CONFLICT DO NOTHING;

INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo, foto_url)
SELECT 
  'Duplo Smash Bacon', 
  28.00, 
  '2 Hambúrgueres smash 120g, queijo cheddar, bacon crocante e molho especial', 
  c.id, 
  true,
  '/src/assets/smash-burger.jpg'
FROM categorias c WHERE c.nome = 'SMASH BURGUER'
ON CONFLICT DO NOTHING;

-- Bebidas
INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo)
SELECT 
  'Refrigerante Lata', 
  4.50, 
  'Coca-Cola, Pepsi, Guaraná, Fanta - 350ml', 
  c.id, 
  true
FROM categorias c WHERE c.nome = 'Bebidas'
ON CONFLICT DO NOTHING;

INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo)
SELECT 
  'Suco Natural', 
  7.00, 
  'Laranja, Limão, Acerola ou Maracujá - 300ml', 
  c.id, 
  true
FROM categorias c WHERE c.nome = 'Bebidas'
ON CONFLICT DO NOTHING;

INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo)
SELECT 
  'Cappuccino', 
  6.50, 
  'Cappuccino cremoso com chocolate polvilhado', 
  c.id, 
  true
FROM categorias c WHERE c.nome = 'BEBIDAS QUENTES'
ON CONFLICT DO NOTHING;

-- Porções
INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo)
SELECT 
  'Batata Frita Grande', 
  12.00, 
  'Porção generosa de batata frita crocante - serve 2 pessoas', 
  c.id, 
  true
FROM categorias c WHERE c.nome = 'PORÇÕES'
ON CONFLICT DO NOTHING;

INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo)
SELECT 
  'Onion Rings', 
  15.00, 
  'Anéis de cebola empanados e fritos - 12 unidades', 
  c.id, 
  true
FROM categorias c WHERE c.nome = 'PORÇÕES'
ON CONFLICT DO NOTHING;

-- Açaí
INSERT INTO itens_cardapio (nome, preco, descricao, categoria_id, ativo, foto_url)
SELECT 
  'Açaí 300ml Completo', 
  14.00, 
  'Açaí 300ml com granola, banana, leite condensado e leite em pó', 
  c.id, 
  true,
  '/src/assets/acai-bowl.jpg'
FROM categorias c WHERE c.nome = 'AÇAÍ E SOBREMESAS'
ON CONFLICT DO NOTHING;