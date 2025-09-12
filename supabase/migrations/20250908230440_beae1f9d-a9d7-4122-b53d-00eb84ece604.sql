-- Verificar e inserir categorias se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'SOBREMESAS') THEN
    INSERT INTO categorias (nome, ativo) VALUES ('SOBREMESAS', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'PROMOÇÃO') THEN
    INSERT INTO categorias (nome, ativo) VALUES ('PROMOÇÃO', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'TRADICIONAIS') THEN
    INSERT INTO categorias (nome, ativo) VALUES ('TRADICIONAIS', true);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM categorias WHERE nome = 'SMASH BURGUER') THEN
    INSERT INTO categorias (nome, ativo) VALUES ('SMASH BURGUER', true);
  END IF;
END $$;

-- Marcar produtos atuais como inativos
UPDATE itens_cardapio SET ativo = false;

-- Inserir produtos do Veneza's Lanches
INSERT INTO itens_cardapio (nome, preco, categoria_id, descricao, ativo, foto_url) VALUES 
('AÇAI NO COPO', 10.00, (SELECT id FROM categorias WHERE nome = 'SOBREMESAS'), 'Saboreie 200 ml de açaí puro com fios de leite condensado, dando um toque mágico!', true, '/src/assets/acai-bowl.jpg'),
('MISTO', 13.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão macio recheado com muçarela derretida e presunto saboroso.', true, '/src/assets/misto-sandwich.jpg'),
('BACON CHEDDAR', 26.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão com suculento bife de hambúrguer, bacon crocante, batata palha, cheddar cremoso derretido.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X TUDO', 23.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Nosso irresistível X-Tudo: pão fresco com bife, ovo, mussarela, presunto, bacon, batata palha, milho e salada.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('SMASH CLÁSSICO', 18.00, (SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), 'Hambúrguer Artesanal bovino esmagado na chapa, cebola crua, American Cheese no Pãozinho brioche.', true, '/src/assets/smash-burger.jpg');

-- Atualizar configuração do restaurante para Veneza's
UPDATE restaurant_config SET 
  nome_restaurante = 'Veneza''s Lanches',
  logo_url = '/lovable-uploads/7879c400-f6d5-4608-b189-9a23e3d9922f.png';