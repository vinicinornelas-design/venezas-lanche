-- Atualizar configuração do restaurante para Veneza's Lanches
UPDATE restaurant_config SET 
  nome_restaurante = 'Veneza''s Lanches',
  telefone = '(31) 99999-0000',
  endereco = 'Rua das Palmeiras, 456 - Centro',
  horario_funcionamento = '{
    "segunda": "17:00-23:00",
    "terca": "17:00-23:00", 
    "quarta": "17:00-23:00",
    "quinta": "17:00-23:00",
    "sexta": "17:00-00:00",
    "sabado": "17:00-00:00",
    "domingo": "17:00-23:00"
  }'::jsonb
WHERE id = (SELECT id FROM restaurant_config LIMIT 1);

-- Inserir configuração se não existir
INSERT INTO restaurant_config (nome_restaurante, telefone, endereco, horario_funcionamento)
SELECT 'Veneza''s Lanches', '(31) 99999-0000', 'Rua das Palmeiras, 456 - Centro', 
       '{"segunda": "17:00-23:00", "terca": "17:00-23:00", "quarta": "17:00-23:00", "quinta": "17:00-23:00", "sexta": "17:00-00:00", "sabado": "17:00-00:00", "domingo": "17:00-23:00"}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM restaurant_config);

-- Adicionar bairros padrão se não existirem
INSERT INTO bairros (nome, taxa_entrega) VALUES 
  ('Centro', 3.00),
  ('Savassi', 4.00),
  ('Funcionários', 4.50),
  ('Santo Antônio', 5.00),
  ('Cidade Nova', 6.00),
  ('Pampulha', 8.00)
ON CONFLICT DO NOTHING;

-- Adicionar métodos de pagamento padrão se não existirem
INSERT INTO payment_methods (nome, fee_type, fee_value) VALUES 
  ('Dinheiro', 'fixed', 0),
  ('PIX', 'fixed', 0),
  ('Cartão de Débito', 'percentage', 2.5),
  ('Cartão de Crédito', 'percentage', 3.5),
  ('Vale Refeição', 'percentage', 4.0)
ON CONFLICT DO NOTHING;

-- Limpar categorias existentes e adicionar categorias do Veneza's
DELETE FROM categorias;
INSERT INTO categorias (nome, ordem) VALUES 
  ('Lanches', 1),
  ('Batata Frita', 2),
  ('Bebidas', 3),
  ('Sobremesas', 4);

-- Limpar itens do cardápio existentes e adicionar produtos do Veneza's
DELETE FROM itens_cardapio;

-- Inserir produtos do Veneza's Lanches
WITH categoria_lanches AS (SELECT id FROM categorias WHERE nome = 'Lanches'),
     categoria_batata AS (SELECT id FROM categorias WHERE nome = 'Batata Frita'),
     categoria_bebidas AS (SELECT id FROM categorias WHERE nome = 'Bebidas'),
     categoria_sobremesas AS (SELECT id FROM categorias WHERE nome = 'Sobremesas')

INSERT INTO itens_cardapio (nome, descricao, preco, categoria_id, foto_url) VALUES 
  -- Lanches
  ('X-Bacon', 'Hambúrguer bovino, bacon, queijo, alface, tomate e molho especial', 18.90, (SELECT id FROM categoria_lanches), '/src/assets/bacon-cheddar-burger.jpg'),
  ('X-Tudo', 'Hambúrguer bovino, bacon, queijo, ovo, presunto, alface, tomate e molho especial', 22.90, (SELECT id FROM categoria_lanches), '/src/assets/smash-burger.jpg'),
  ('Misto Quente', 'Pão de forma, presunto, queijo e manteiga', 8.90, (SELECT id FROM categoria_lanches), '/src/assets/misto-sandwich.jpg'),
  ('X-Salada', 'Hambúrguer bovino, queijo, alface, tomate e molho especial', 15.90, (SELECT id FROM categoria_lanches), '/src/assets/restaurant-banner.jpg'),
  
  -- Batata Frita  
  ('Batata Frita Simples', 'Porção individual de batata frita crocante', 12.90, (SELECT id FROM categoria_batata), '/src/assets/restaurant-banner.jpg'),
  ('Batata Frita com Bacon', 'Batata frita coberta com bacon crocante e queijo', 18.90, (SELECT id FROM categoria_batata), '/src/assets/restaurant-banner.jpg'),
  
  -- Bebidas
  ('Coca-Cola 350ml', 'Refrigerante Coca-Cola lata', 4.50, (SELECT id FROM categoria_bebidas), '/src/assets/restaurant-banner.jpg'),
  ('Suco Natural 500ml', 'Suco natural de frutas da estação', 8.90, (SELECT id FROM categoria_bebidas), '/src/assets/restaurant-banner.jpg'),
  
  -- Sobremesas
  ('Açaí 300ml', 'Açaí cremoso com banana e granola', 12.90, (SELECT id FROM categoria_sobremesas), '/src/assets/acai-bowl.jpg');

-- Configurar 20 mesas se não existirem
INSERT INTO mesas (numero, status) 
SELECT generate_series(1, 20), 'LIVRE'
WHERE NOT EXISTS (SELECT 1 FROM mesas WHERE numero BETWEEN 1 AND 20);

-- Criar funcionário admin padrão se não existir
INSERT INTO funcionarios (nome, email, cargo, nivel_acesso) VALUES 
  ('Administrador', 'admin@venezaslanches.com', 'Gerente', 'ADMIN')
ON CONFLICT DO NOTHING;