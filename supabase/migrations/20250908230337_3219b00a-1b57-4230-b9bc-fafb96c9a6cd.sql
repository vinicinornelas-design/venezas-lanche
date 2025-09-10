-- Inserir categorias específicas do Veneza's sem conflito
INSERT INTO categorias (nome, ativo) VALUES 
('SOBREMESAS', true),
('PROMOÇÃO', true), 
('TRADICIONAIS', true),
('PÃO DE SAL', true),
('SMASH BURGUER', true),
('ARTESANAIS', true)
ON CONFLICT (nome) DO NOTHING;

-- Marcar todos os produtos atuais como inativos para que não apareçam no cardápio
UPDATE itens_cardapio SET ativo = false;

-- Inserir produtos do cardápio Veneza's Lanches (novos)
INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) VALUES 
-- SOBREMESAS
('CHOCOLATE', 1.00, (SELECT id FROM categorias WHERE nome = 'SOBREMESAS'), 'Bora adoçar sua noite? Escolha o seu favorito.', true, '/src/assets/restaurant-banner.jpg'),
('AÇAI NO COPO', 10.00, (SELECT id FROM categorias WHERE nome = 'SOBREMESAS'), 'Saboreie 200 ml de açaí puro com fios de leite condensado, dando um toque mágico! O volume pode variar devido à textura e densidade do açaí.', true, '/src/assets/acai-bowl.jpg'),

-- PROMOÇÃO
('HAMBUGUER + AÇAI', 23.00, (SELECT id FROM categorias WHERE nome = 'PROMOÇÃO'), 'Promoção exclusiva: Hambúrguer simples e 200 ml de açaí puro com fios de leite condensado! Não perca essa combinação irresistível e refrescante.', true, '/src/assets/restaurant-banner.jpg'),

-- TRADICIONAIS
('MISTO', 13.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão macio recheado com muçarela derretida e presunto saboroso.', true, '/src/assets/misto-sandwich.jpg'),
('HAMBÚRGUER', 13.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão com suculento bife de hambúrguer, batata palha, milho e salada fresca.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('BACON BURGUER', 20.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão tostado na chapa com suculento bife de hambúrguer, bacon crocante, batata palha, milho e uma refrescante salada.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('BACON CHEDDAR', 26.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão com suculento bife de hambúrguer, bacon crocante, batata palha, cheddar cremoso derretido, milho e uma salada fresca.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('MISTO BACON', 18.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Delicioso Misto com bacon crocante, muçarela derretida, presunto suculento, tudo envolto em pão fresco e macio.', true, '/src/assets/misto-sandwich.jpg'),
('MISTO C/OVO', 17.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão fresquinho com ovo frito, muçarela derretida e presunto suculento.', true, '/src/assets/misto-sandwich.jpg'),
('X BURGUER', 19.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão, Bife, muçarela, Milho, Batata Palha E Salada.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X CABULOSO', 30.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'O X-Cabuloso apresenta dois generosos bifes de excelente qualidade, bacon crocante, cheddar cremoso e Catupiry em um pão macio. Com batata palha crocante, milho verde e uma refrescante salada para um contraste de sabores, é uma experiência verdadeiramente única e saborosa.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X CAPRICHADO', 32.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'O X-Caprichado é uma explosão de sabores: pão macio, suculento bife, bacon em cubos salteados com frango cremoso, ovo, presunto, mussarela derretida, Catupiry, batata palha, milho e salada fresca. Uma combinação perfeita de texturas e gostos!', true, '/src/assets/bacon-cheddar-burger.jpg');

-- Atualizar configuração do restaurante com nome e logo do Veneza's
INSERT INTO restaurant_config (nome_restaurante, logo_url) VALUES 
('Veneza''s Lanches', '/lovable-uploads/7879c400-f6d5-4608-b189-9a23e3d9922f.png')
ON CONFLICT (id) DO UPDATE SET
  nome_restaurante = EXCLUDED.nome_restaurante,
  logo_url = EXCLUDED.logo_url;