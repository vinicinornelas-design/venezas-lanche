-- Insert restaurant configuration
INSERT INTO restaurant_config (
  nome_restaurante, 
  telefone, 
  endereco, 
  horario_funcionamento
) VALUES (
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
) ON CONFLICT (id) DO UPDATE SET
  nome_restaurante = EXCLUDED.nome_restaurante,
  telefone = EXCLUDED.telefone,
  endereco = EXCLUDED.endereco,
  horario_funcionamento = EXCLUDED.horario_funcionamento;

-- Insert/Update categories from the menu
INSERT INTO categorias (id, nome, ordem, ativo) VALUES 
  ('cat_sobremesas', 'Sobremesas', 1, true),
  ('cat_promocao', 'Promoção', 2, true),
  ('cat_tradicionais', 'Tradicionais', 3, true),
  ('cat_pao_sal', 'Pão de Sal', 4, true),
  ('cat_smash', 'Smash Burguer', 5, true)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  ordem = EXCLUDED.ordem,
  ativo = EXCLUDED.ativo;

-- Insert menu items based on the website data
INSERT INTO itens_cardapio (id, nome, descricao, preco, categoria_id, ativo) VALUES 
  -- Sobremesas
  ('item_chocolate', 'Chocolate', 'Bora adoçar sua noite? Escolha o seu favorito.', 1.00, 'cat_sobremesas', true),
  ('item_acai_copo', 'Açaí no Copo', 'Saboreie 200 ml de açaí puro com fios de leite condensado, dando um toque mágico! O volume pode variar devido à textura e densidade do açaí.', 10.00, 'cat_sobremesas', true),
  
  -- Promoção
  ('item_hamburguer_acai', 'Hambúrguer + Açaí', 'Promoção exclusiva: Hambúrguer simples e 200 ml de açaí puro com fios de leite condensado! Não perca essa combinação irresistível e refrescante.', 23.00, 'cat_promocao', true),
  
  -- Tradicionais
  ('item_misto', 'Misto', 'Pão macio recheado com muçarela derretida e presunto saboroso.', 13.00, 'cat_tradicionais', true),
  ('item_hamburguer', 'Hambúrguer', 'Pão com suculento bife de hambúrguer, batata palha, milho e salada fresca.', 13.00, 'cat_tradicionais', true),
  ('item_bacon_burguer', 'Bacon Burguer', 'Pão tostado na chapa com suculento bife de hambúrguer, bacon crocante, batata palha, milho e uma refrescante salada.', 20.00, 'cat_tradicionais', true),
  ('item_bacon_cheddar', 'Bacon Cheddar', 'Pão com suculento bife de hambúrguer, bacon crocante, batata palha, cheddar cremoso derretido, milho e uma salada fresca.', 26.00, 'cat_tradicionais', true),
  ('item_misto_bacon', 'Misto Bacon', 'Delicioso Misto com bacon crocante, muçarela derretida, presunto suculento, tudo envolto em pão fresco e macio.', 18.00, 'cat_tradicionais', true),
  ('item_misto_ovo', 'Misto c/ Ovo', 'Pão fresquinho com ovo frito, muçarela derretida e presunto suculento.', 17.00, 'cat_tradicionais', true),
  ('item_x_burguer', 'X Burguer', 'Pão, Bife, muçarela, Milho, Batata Palha E Salada.', 19.00, 'cat_tradicionais', true),
  ('item_x_cabuloso', 'X Cabuloso', 'O X-Cabuloso apresenta dois generosos bifes de excelente qualidade, bacon crocante, cheddar cremoso e Catupiry em um pão macio. Com batata palha crocante, milho verde e uma refrescante salada para um contraste de sabores, é uma experiência verdadeiramente única e saborosa.', 30.00, 'cat_tradicionais', true),
  ('item_x_caprichado', 'X Caprichado', 'O X-Caprichado é uma explosão de sabores: pão macio, suculento bife, bacon em cubos salteados com frango cremoso, ovo, presunto, mussarela derretida, Catupiry, batata palha, milho e salada fresca. Uma combinação perfeita de texturas e gostos!', 32.00, 'cat_tradicionais', true),
  ('item_x_egg', 'X Egg', 'Pão tostado na chapa com bife de hambúrguer, ovo, muçarela derretida, batata palha, milho e salada fresca.', 18.00, 'cat_tradicionais', true),
  ('item_x_egg_bacon', 'X Egg Bacon', 'Pão tostado na chapa com bife de hambúrguer, ovo, muçarela derretida, bacon crocante, batata palha, milho e salada fresca.', 22.00, 'cat_tradicionais', true),
  ('item_x_frango', 'X Frango', 'Pão tostado com suculento frango cremoso, queijo muçarela derretido, milho verde, batata palha crocante e uma fresca salada.', 20.00, 'cat_tradicionais', true),
  ('item_x_tudo', 'X Tudo', 'Nosso irresistível X-Tudo, campeão de vendas: pão fresco tostado na chapa recheado com suculento bife de hambúrguer, ovo frito, mussarela derretida, presunto, bacon crocante, batata palha, milho e uma refrescante salada.', 23.00, 'cat_tradicionais', true),
  ('item_x_bacon', 'X-Bacon', 'Pão com bife suculento, bacon crocante, queijo mussarela derretido, batata palha, milho e salada fresca.', 21.00, 'cat_tradicionais', true),
  ('item_vulcao_burguer', 'Vulcão Burguer', 'Experimente o "Vulcão Burger", uma explosão de sabores intensos e texturas incríveis. Pão fresco com três suculentos bifes grelhados na chapa, dois ovos fritos, Catupiry cremoso, cebola caramelizada e Batatas fritas crocantes, perfeitamente inseridas no pão. Uma experiência gastronômica única em cada mordida!', 26.00, 'cat_tradicionais', true),
  ('item_x_tornado', 'X Tornado', 'Pão macio e dourado, 2 bifes suculentos, 2 ovos fritos no ponto, muçarela derretida, presunto, bacon crocante, frango grelhado e suculento, catupiry cremoso, cheddar derretido, batata palha crocante, milho fresquinho e uma salada fresca e colorida. Uma explosão de sabores que vai te deixar com água na boca!', 36.00, 'cat_tradicionais', true),
  ('item_x_terremoto', 'X Terremoto', 'Pão macio, 3 suculentos bifes, 3 ovos, muçarela derretida, presunto, bacon crocante, batata palha crocante, milho fresquinho e uma deliciosa salada.', 31.00, 'cat_tradicionais', true),
  
  -- Pão de Sal
  ('item_pao_costela', 'Pão c/ Costela', 'Pão de sal fresquinho, recheado com costela ao molho barbecue e acompanhado de salada.', 23.00, 'cat_pao_sal', true),
  ('item_pao_costela_especial', 'Pão c/ Costela Especial', 'Pão de sal, recheado com bacon crocante, costela suculenta ao molho barbecue, catupiry cremoso e uma salada fresquinha que traz o equilíbrio perfeito.', 28.00, 'cat_pao_sal', true),
  ('item_pao_linguica', 'Pão com Linguiça', 'Pão de sal quentinho, recheado com linguiça suculenta, um molho especial e uma salada fresquinha que combina perfeitamente.', 20.00, 'cat_pao_sal', true),
  ('item_x_egg_bacon_linguica', 'X Egg Bacon Linguiça', 'Pão, Bacon, Linguiça, muçarela, Ovo, Molho Especial E Salada', 28.00, 'cat_pao_sal', true),
  
  -- Smash Burguer
  ('item_smash_classico', 'Smash Clássico', 'Smash (Hambúrguer Artesanal bovino esmagado na chapa), cebola crua, American Cheese (nosso queijo derretido no bife bovino) por fim colocamos no Pãozinho brioche. O Clássico do mundo do Hambúrguer!', 18.00, 'cat_smash', true),
  ('item_smash_triplo', 'Smash Triplo', 'Smash (Hambúrguer Artesanal bovino esmagado na chapa), Cheddar derretido, Cebola caramelizada, Molho especial no Pãozinho brioche selado na chapa.', 30.00, 'cat_smash', true),
  ('item_smash_salada', 'Smash Salada', '02 Smash (Hambúrguer Artesanal bovino esmagado na chapa), American Cheese (Queijo cheddar derretido no bife), Cebola crua, muita salada e Molho especial no Pãozinho brioche.', 31.00, 'cat_smash', true),
  ('item_smash_frango', 'Smash Frango', 'Pão brioche selado na chapa, Burger artesanal de frango chapeado 120g, queijo derretido, cebola crua, salada fresquinha com nosso molho especial.', 31.00, 'cat_smash', true),
  ('item_smash_linguica', 'Smash Linguiça', 'Pão brioche, burger de linguiça toscana 120grs, requeijão cremoso, tomate, alface no melado de canã e molho especial da casa.', 30.00, 'cat_smash', true)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao,
  preco = EXCLUDED.preco,
  categoria_id = EXCLUDED.categoria_id,
  ativo = EXCLUDED.ativo;

-- Insert sample neighborhoods with delivery fees
INSERT INTO bairros (id, nome, taxa_entrega, ativo) VALUES 
  ('bairro_centro', 'Centro', 3.00, true),
  ('bairro_savassi', 'Savassi', 5.00, true),
  ('bairro_funcionarios', 'Funcionários', 4.00, true),
  ('bairro_pampulha', 'Pampulha', 8.00, true),
  ('bairro_mangabeiras', 'Mangabeiras', 6.00, true),
  ('bairro_castelo', 'Castelo', 7.00, true),
  ('bairro_santa_efigenia', 'Santa Efigênia', 4.50, true),
  ('bairro_floresta', 'Floresta', 5.50, true)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  taxa_entrega = EXCLUDED.taxa_entrega,
  ativo = EXCLUDED.ativo;

-- Insert payment methods with fees
INSERT INTO payment_methods (id, nome, fee_type, fee_value, ativo) VALUES 
  ('payment_dinheiro', 'Dinheiro', 'fixed', 0.00, true),
  ('payment_pix', 'PIX', 'fixed', 0.00, true),
  ('payment_debito', 'Cartão de Débito', 'percentage', 2.5, true),
  ('payment_credito', 'Cartão de Crédito', 'percentage', 3.8, true),
  ('payment_vale_refeicao', 'Vale Refeição', 'percentage', 4.2, true),
  ('payment_vale_alimentacao', 'Vale Alimentação', 'percentage', 4.2, true)
ON CONFLICT (id) DO UPDATE SET
  nome = EXCLUDED.nome,
  fee_type = EXCLUDED.fee_type,
  fee_value = EXCLUDED.fee_value,
  ativo = EXCLUDED.ativo;

-- Create tables from 1 to 20
INSERT INTO mesas (numero, status, etiqueta) 
SELECT 
  generate_series(1, 20) as numero,
  'LIVRE' as status,
  'Mesa ' || generate_series(1, 20) as etiqueta
ON CONFLICT (numero) DO NOTHING;