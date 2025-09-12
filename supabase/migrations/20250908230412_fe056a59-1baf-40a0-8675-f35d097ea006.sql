-- Inserir categorias específicas do Veneza's
INSERT INTO categorias (nome, ativo) VALUES 
('SOBREMESAS', true),
('PROMOÇÃO', true), 
('TRADICIONAIS', true),
('PÃO DE SAL', true),
('SMASH BURGUER', true),
('ARTESANAIS', true)
ON CONFLICT (nome) DO NOTHING;

-- Marcar produtos atuais como inativos para mostrar só os novos
UPDATE itens_cardapio SET ativo = false;

-- Inserir apenas alguns produtos principais para começar
INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) VALUES 
-- SOBREMESAS
('CHOCOLATE', 1.00, (SELECT id FROM categorias WHERE nome = 'SOBREMESAS'), 'Bora adoçar sua noite? Escolha o seu favorito.', true, '/src/assets/restaurant-banner.jpg'),
('AÇAI NO COPO', 10.00, (SELECT id FROM categorias WHERE nome = 'SOBREMESAS'), 'Saboreie 200 ml de açaí puro com fios de leite condensado, dando um toque mágico!', true, '/src/assets/acai-bowl.jpg'),

-- TRADICIONAIS
('MISTO', 13.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão macio recheado com muçarela derretida e presunto saboroso.', true, '/src/assets/misto-sandwich.jpg'),
('BACON CHEDDAR', 26.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão com suculento bife de hambúrguer, bacon crocante, batata palha, cheddar cremoso derretido.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X TUDO', 23.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Nosso irresistível X-Tudo: pão fresco com bife, ovo, mussarela, presunto, bacon, batata palha, milho e salada.', true, '/src/assets/bacon-cheddar-burger.jpg'),

-- SMASH BURGUER  
('SMASH CLÁSSICO', 18.00, (SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), 'Hambúrguer Artesanal bovino esmagado na chapa, cebola crua, American Cheese no Pãozinho brioche.', true, '/src/assets/smash-burger.jpg'),
('SMASH TRIPLO', 30.00, (SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), 'Smash com Cheddar derretido, Cebola caramelizada, Molho especial no Pãozinho brioche.', true, '/src/assets/smash-burger.jpg');

-- Atualizar configuração do restaurante
UPDATE restaurant_config SET 
  nome_restaurante = 'Veneza''s Lanches',
  logo_url = '/lovable-uploads/7879c400-f6d5-4608-b189-9a23e3d9922f.png';