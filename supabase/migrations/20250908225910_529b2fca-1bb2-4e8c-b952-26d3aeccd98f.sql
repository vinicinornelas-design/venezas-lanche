-- Limpar produtos existentes e inserir cardápio do Veneza's Lanches
DELETE FROM produtos;

-- Inserir categorias específicas do Veneza's
INSERT INTO categorias (nome, ativo) VALUES 
('SOBREMESAS', true),
('PROMOÇÃO', true),
('TRADICIONAIS', true),
('PÃO DE SAL', true),
('SMASH BURGUER', true)
ON CONFLICT (nome) DO NOTHING;

-- Inserir produtos do cardápio Veneza's Lanches
INSERT INTO produtos (nome, preco, categoria_id, descricao, ativo, imagem_url) VALUES 

-- SOBREMESAS
((SELECT id FROM categorias WHERE nome = 'SOBREMESAS'), 'CHOCOLATE', 1.00, 'Bora adoçar sua noite? Escolha o seu favorito.', true, '/src/assets/restaurant-banner.jpg'),
((SELECT id FROM categorias WHERE nome = 'SOBREMESAS'), 'AÇAI NO COPO', 10.00, 'Saboreie 200 ml de açaí puro com fios de leite condensado, dando um toque mágico! O volume pode variar devido à textura e densidade do açaí.', true, '/src/assets/acai-bowl.jpg'),

-- PROMOÇÃO
((SELECT id FROM categorias WHERE nome = 'PROMOÇÃO'), 'HAMBUGUER + AÇAI', 23.00, 'Promoção exclusiva: Hambúrguer simples e 200 ml de açaí puro com fios de leite condensado! Não perca essa combinação irresistível e refrescante.', true, '/src/assets/restaurant-banner.jpg'),

-- TRADICIONAIS
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'MISTO', 13.00, 'Pão macio recheado com muçarela derretida e presunto saboroso.', true, '/src/assets/misto-sandwich.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'HAMBÚRGUER', 13.00, 'Pão com suculento bife de hambúrguer, batata palha, milho e salada fresca.', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'BACON BURGUER', 20.00, 'Pão tostado na chapa com suculento bife de hambúrguer, bacon crocante, batata palha, milho e uma refrescante salada.', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'BACON CHEDDAR', 26.00, 'Pão com suculento bife de hambúrguer, bacon crocante, batata palha, cheddar cremoso derretido, milho e uma salada fresca.', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'MISTO BACON', 18.00, 'Delicioso Misto com bacon crocante, muçarela derretida, presunto suculento, tudo envolto em pão fresco e macio.', true, '/src/assets/misto-sandwich.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'MISTO C/OVO', 17.00, 'Pão fresquinho com ovo frito, muçarela derretida e presunto suculento.', true, '/src/assets/misto-sandwich.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'X BURGUER', 19.00, 'Pão, Bife, muçarela, Milho, Batata Palha E Salada.', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'X CABULOSO', 30.00, 'O X-Cabuloso apresenta dois generosos bifes de excelente qualidade, bacon crocante, cheddar cremoso e Catupiry em um pão macio. Com batata palha crocante, milho verde e uma refrescante salada para um contraste de sabores, é uma experiência verdadeiramente única e saborosa.', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'X CAPRICHADO', 32.00, 'O X-Caprichado é uma explosão de sabores: pão macio, suculento bife, bacon em cubos salteados com frango cremoso, ovo, presunto, mussarela derretida, Catupiry, batata palha, milho e salada fresca. Uma combinação perfeita de texturas e gostos!', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'X EGG', 18.00, 'Pão tostado na chapa com bife de hambúrguer, ovo, muçarela derretida, batata palha, milho e salada fresca.', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'X EGG BACON', 22.00, 'Pão tostado na chapa com bife de hambúrguer, ovo, muçarela derretida, bacon crocante, batata palha, milho e salada fresca.', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'X FRANGO', 20.00, 'Pão tostado com suculento frango cremoso, queijo muçarela derretido, milho verde, batata palha crocante e uma fresca salada.', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'X TUDO', 23.00, 'Nosso irresistível X-Tudo, campeão de vendas: pão fresco tostado na chapa recheado com suculento bife de hambúrguer, ovo frito, mussarela derretida, presunto, bacon crocante, batata palha, milho e uma refrescante salada.', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'X-BACON', 21.00, 'Pão com bife suculento, bacon crocante, queijo mussarela derretido, batata palha, milho e salada fresca.', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'VULCÃO BURGUER', 26.00, 'Experimente o "Vulcão Burger", uma explosão de sabores intensos e texturas incríveis. Pão fresco com três suculentos bifes grelhados na chapa, dois ovos fritos, Catupiry cremoso, cebola caramelizada e Batatas fritas crocantes, perfeitamente inseridas no pão. Uma experiência gastronômica única em cada mordida!', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'X TORNADO', 36.00, 'Pão macio e dourado, 2 bifes suculentos, 2 ovos fritos no ponto, muçarela derretida, presunto, bacon crocante, frango grelhado e suculento, catupiry cremoso, cheddar derretido, batata palha crocante, milho fresquinho e uma salada fresca e colorida. Uma explosão de sabores que vai te deixar com água na boca!', true, '/src/assets/bacon-cheddar-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'X TERREMOTO', 31.00, 'Pão macio, 3 suculentos bifes, 3 ovos, muçarela derretida, presunto, bacon crocante, batata palha crocante, milho fresquinho e uma deliciosa salada.', true, '/src/assets/bacon-cheddar-burger.jpg'),

-- PÃO DE SAL
((SELECT id FROM categorias WHERE nome = 'PÃO DE SAL'), 'PÃO C/ COSTELA', 23.00, 'Pão de sal fresquinho, recheado com costela ao molho barbecue e acompanhado de salada.', true, '/src/assets/restaurant-banner.jpg'),
((SELECT id FROM categorias WHERE nome = 'PÃO DE SAL'), 'PÃO C/ COSTELA ESPECIAL', 28.00, 'Pão de sal, recheado com bacon crocante, costela suculenta ao molho barbecue, catupiry cremoso e uma salada fresquinha que traz o equilíbrio perfeito.', true, '/src/assets/restaurant-banner.jpg'),
((SELECT id FROM categorias WHERE nome = 'PÃO DE SAL'), 'PÃO COM LINGUIÇA', 20.00, 'Pão de sal quentinho, recheado com linguiça suculenta, um molho especial e uma salada fresquinha que combina perfeitamente.', true, '/src/assets/restaurant-banner.jpg'),
((SELECT id FROM categorias WHERE nome = 'PÃO DE SAL'), 'X EGG BACON LIGUIÇA', 28.00, 'Pão, Bacon, Linguiça, muçarela, Ovo, Molho Especial E Salada', true, '/src/assets/restaurant-banner.jpg'),

-- SMASH BURGUER
((SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), 'SMASH CLÁSSICO', 18.00, 'Smash (Hambúrguer Artesanal bovino esmagado na chapa), cebola crua, American Cheese (nosso queijo derretido no bife bovino) por fim colocamos no Pãozinho brioche. O Clássico do mundo do Hambúrguer!', true, '/src/assets/smash-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), 'SMASH TRIPLO', 30.00, 'Smash (Hambúrguer Artesanal bovino esmagado na chapa), Cheddar derretido, Cebola caramelizada, Molho especial no Pãozinho brioche selado na chapa.', true, '/src/assets/smash-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), 'SMASH SALADA', 31.00, '02 Smash (Hambúrguer Artesanal bovino esmagado na chapa), American Cheese (Queijo cheddar derretido no bife), Cebola crua, muita salada e Molho especial no Pãozinho brioche.', true, '/src/assets/smash-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), 'SMASH FRANGO', 31.00, 'Pão brioche selado na chapa, Burger artesanal de frango chapeado 120g, queijo derretido, cebola crua, salada fresquinha com nosso molho especial.', true, '/src/assets/smash-burger.jpg'),
((SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), 'SMASH LINGUIÇA', 31.00, 'Pão brioche, burger de linguiça toscana 120grs, requeijão cremoso, tomate, alface no melado de canã e molho especial da casa.', true, '/src/assets/smash-burger.jpg');