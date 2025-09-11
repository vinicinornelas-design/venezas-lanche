-- Insert restaurant configuration
INSERT INTO restaurant_config (
  nome_restaurante, 
  telefone, 
  endereco, 
  horario_funcionamento
) 
SELECT 
  'Venezas Lanches',
  '(31) 99999-9999',
  'Rua das Delícias, 123 - Centro',
  '{
    "segunda": "18:00-23:00",
    "terca": "18:00-23:00", 
    "quarta": "18:00-23:00",
    "quinta": "18:00-23:00",
    "sexta": "18:00-23:00",
    "sabado": "18:00-00:00",
    "domingo": "18:00-23:00"
  }'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM restaurant_config);

-- Clear existing data to start fresh
DELETE FROM itens_cardapio;
DELETE FROM categorias;
DELETE FROM bairros;
DELETE FROM payment_methods;

-- Insert categories from the menu
INSERT INTO categorias (nome, ordem, ativo) VALUES 
  ('Sobremesas', 1, true),
  ('Promoção', 2, true),
  ('Tradicionais', 3, true),
  ('Pão de Sal', 4, true),
  ('Smash Burguer', 5, true);

-- Get category IDs for menu items and insert them
INSERT INTO itens_cardapio (nome, descricao, preco, categoria_id, ativo) 
VALUES 
  -- Sobremesas
  ('Chocolate', 'Bora adoçar sua noite? Escolha o seu favorito.', 1.00, (SELECT id FROM categorias WHERE nome = 'Sobremesas'), true),
  ('Açaí no Copo', 'Saboreie 200 ml de açaí puro com fios de leite condensado, dando um toque mágico! O volume pode variar devido à textura e densidade do açaí.', 10.00, (SELECT id FROM categorias WHERE nome = 'Sobremesas'), true),
  
  -- Promoção
  ('Hambúrguer + Açaí', 'Promoção exclusiva: Hambúrguer simples e 200 ml de açaí puro com fios de leite condensado! Não perca essa combinação irresistível e refrescante.', 23.00, (SELECT id FROM categorias WHERE nome = 'Promoção'), true),
  
  -- Tradicionais (adding just a few key items to start)
  ('Misto', 'Pão macio recheado com muçarela derretida e presunto saboroso.', 13.00, (SELECT id FROM categorias WHERE nome = 'Tradicionais'), true),
  ('Hambúrguer', 'Pão com suculento bife de hambúrguer, batata palha, milho e salada fresca.', 13.00, (SELECT id FROM categorias WHERE nome = 'Tradicionais'), true),
  ('Bacon Burguer', 'Pão tostado na chapa com suculento bife de hambúrguer, bacon crocante, batata palha, milho e uma refrescante salada.', 20.00, (SELECT id FROM categorias WHERE nome = 'Tradicionais'), true),
  ('Bacon Cheddar', 'Pão com suculento bife de hambúrguer, bacon crocante, batata palha, cheddar cremoso derretido, milho e uma salada fresca.', 26.00, (SELECT id FROM categorias WHERE nome = 'Tradicionais'), true),
  ('X Tudo', 'Nosso irresistível X-Tudo, campeão de vendas: pão fresco tostado na chapa recheado com suculento bife de hambúrguer, ovo frito, mussarela derretida, presunto, bacon crocante, batata palha, milho e uma refrescante salada.', 23.00, (SELECT id FROM categorias WHERE nome = 'Tradicionais'), true),
  
  -- Smash Burguer
  ('Smash Clássico', 'Smash (Hambúrguer Artesanal bovino esmagado na chapa), cebola crua, American Cheese (nosso queijo derretido no bife bovino) por fim colocamos no Pãozinho brioche. O Clássico do mundo do Hambúrguer!', 18.00, (SELECT id FROM categorias WHERE nome = 'Smash Burguer'), true),
  ('Smash Triplo', 'Smash (Hambúrguer Artesanal bovino esmagado na chapa), Cheddar derretido, Cebola caramelizada, Molho especial no Pãozinho brioche selado na chapa.', 30.00, (SELECT id FROM categorias WHERE nome = 'Smash Burguer'), true);

-- Insert sample neighborhoods with delivery fees
INSERT INTO bairros (nome, taxa_entrega, ativo) VALUES 
  ('Centro', 3.00, true),
  ('Savassi', 5.00, true),
  ('Funcionários', 4.00, true),
  ('Pampulha', 8.00, true),
  ('Mangabeiras', 6.00, true),
  ('Castelo', 7.00, true),
  ('Santa Efigênia', 4.50, true),
  ('Floresta', 5.50, true);

-- Insert payment methods with corrected fee_type values
INSERT INTO payment_methods (nome, fee_type, fee_value, ativo) VALUES 
  ('Dinheiro', 'fixed', 0.00, true),
  ('PIX', 'fixed', 0.00, true),
  ('Cartão de Débito', 'fixed', 2.50, true),
  ('Cartão de Crédito', 'fixed', 3.80, true),
  ('Vale Refeição', 'fixed', 4.20, true),
  ('Vale Alimentação', 'fixed', 4.20, true);

-- Create tables from 1 to 20
DO $$
BEGIN
  FOR i IN 1..20 LOOP
    INSERT INTO mesas (numero, status, etiqueta) 
    VALUES (i, 'LIVRE', 'Mesa ' || i)
    ON CONFLICT (numero) DO NOTHING;
  END LOOP;
END $$;