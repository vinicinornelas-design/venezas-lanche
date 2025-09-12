-- Inserir categorias específicas do Veneza's sem conflito
INSERT INTO categorias (nome, ativo) VALUES 
('SOBREMESAS', true),
('PROMOÇÃO', true), 
('TRADICIONAIS', true),
('PÃO DE SAL', true),
('SMASH BURGUER', true),
('ARTESANAIS', true)
ON CONFLICT (nome) DO NOTHING;

-- Marcar todos os produtos atuais como inativos
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
('X CAPRICHADO', 32.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'O X-Caprichado é uma explosão de sabores: pão macio, suculento bife, bacon em cubos salteados com frango cremoso, ovo, presunto, mussarela derretida, Catupiry, batata palha, milho e salada fresca. Uma combinação perfeita de texturas e gostos!', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X EGG', 18.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão tostado na chapa com bife de hambúrguer, ovo, muçarela derretida, batata palha, milho e salada fresca.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X EGG BACON', 22.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão tostado na chapa com bife de hambúrguer, ovo, muçarela derretida, bacon crocante, batata palha, milho e salada fresca.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X FRANGO', 20.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão tostado com suculento frango cremoso, queijo muçarela derretido, milho verde, batata palha crocante e uma fresca salada.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X TUDO', 23.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Nosso irresistível X-Tudo, campeão de vendas: pão fresco tostado na chapa recheado com suculento bife de hambúrguer, ovo frito, mussarela derretida, presunto, bacon crocante, batata palha, milho e uma refrescante salada.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X-BACON', 21.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão com bife suculento, bacon crocante, queijo mussarela derretido, batata palha, milho e salada fresca.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('VULCÃO BURGUER', 26.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Experimente o "Vulcão Burger", uma explosão de sabores intensos e texturas incríveis. Pão fresco com três suculentos bifes grelhados na chapa, dois ovos fritos, Catupiry cremoso, cebola caramelizada e Batatas fritas crocantes, perfeitamente inseridas no pão. Uma experiência gastronômica única em cada mordida!', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X TORNADO', 36.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão macio e dourado, 2 bifes suculentos, 2 ovos fritos no ponto, muçarela derretida, presunto, bacon crocante, frango grelhado e suculento, catupiry cremoso, cheddar derretido, batata palha crocante, milho fresquinho e uma salada fresca e colorida. Uma explosão de sabores que vai te deixar com água na boca!', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X TERREMOTO', 31.00, (SELECT id FROM categorias WHERE nome = 'TRADICIONAIS'), 'Pão macio, 3 suculentos bifes, 3 ovos, muçarela derretida, presunto, bacon crocante, batata palha crocante, milho fresquinho e uma deliciosa salada.', true, '/src/assets/bacon-cheddar-burger.jpg'),

-- PÃO DE SAL
('PÃO C/ COSTELA', 23.00, (SELECT id FROM categorias WHERE nome = 'PÃO DE SAL'), 'Pão de sal fresquinho, recheado com costela ao molho barbecue e acompanhado de salada.', true, '/src/assets/restaurant-banner.jpg'),
('PÃO C/ COSTELA ESPECIAL', 28.00, (SELECT id FROM categorias WHERE nome = 'PÃO DE SAL'), 'Pão de sal, recheado com bacon crocante, costela suculenta ao molho barbecue, catupiry cremoso e uma salada fresquinha que traz o equilíbrio perfeito.', true, '/src/assets/restaurant-banner.jpg'),
('PÃO COM LINGUIÇA', 20.00, (SELECT id FROM categorias WHERE nome = 'PÃO DE SAL'), 'Pão de sal quentinho, recheado com linguiça suculenta, um molho especial e uma salada fresquinha que combina perfeitamente.', true, '/src/assets/restaurant-banner.jpg'),
('X EGG BACON LIGUIÇA', 28.00, (SELECT id FROM categorias WHERE nome = 'PÃO DE SAL'), 'Pão, Bacon, Linguiça, muçarela, Ovo, Molho Especial E Salada', true, '/src/assets/restaurant-banner.jpg'),

-- SMASH BURGUER
('SMASH CLÁSSICO', 18.00, (SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), 'Smash (Hambúrguer Artesanal bovino esmagado na chapa), cebola crua, American Cheese (nosso queijo derretido no bife bovino) por fim colocamos no Pãozinho brioche. O Clássico do mundo do Hambúrguer!', true, '/src/assets/smash-burger.jpg'),
('SMASH TRIPLO', 30.00, (SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), 'Smash (Hambúrguer Artesanal bovino esmagado na chapa), Cheddar derretido, Cebola caramelizada, Molho especial no Pãozinho brioche selado na chapa.', true, '/src/assets/smash-burger.jpg'),
('SMASH SALADA', 31.00, (SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), '02 Smash (Hambúrguer Artesanal bovino esmagado na chapa), American Cheese (Queijo cheddar derretido no bife), Cebola crua, muita salada e Molho especial no Pãozinho brioche.', true, '/src/assets/smash-burger.jpg'),
('SMASH FRANGO', 31.00, (SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), 'Pão brioche selado na chapa, Burger artesanal de frango chapeado 120g, queijo derretido, cebola crua, salada fresquinha com nosso molho especial.', true, '/src/assets/smash-burger.jpg'),
('SMASH LINGUIÇA', 31.00, (SELECT id FROM categorias WHERE nome = 'SMASH BURGUER'), 'Pão brioche, burger de linguiça toscana 120grs, requeijão cremoso, tomate, alface no melado de canã e molho especial da casa.', true, '/src/assets/smash-burger.jpg'),

-- ARTESANAIS  
('BIG BUGUER', 26.00, (SELECT id FROM categorias WHERE nome = 'ARTESANAIS'), 'Pão Brioche, Blend Bovino 130g, muçarela, Cebola Caramelizada e Molho Especial. Acompanha Batata frita maravilhosa!', true, '/src/assets/bacon-cheddar-burger.jpg'),
('BUGUER CREMOSO', 31.00, (SELECT id FROM categorias WHERE nome = 'ARTESANAIS'), 'Pão Brioche, Blend Bovino 140g ao ponto, com bastate Catupiry, cheddar e farelo de bacon crocante. Acampanha uma deliciosa batata frita.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('BUGUER PICANTE', 31.00, (SELECT id FROM categorias WHERE nome = 'ARTESANAIS'), 'Pão Brioche, Bacon, Blend Bovino 140g, Cebola caramelizada Ao Molho de Pimenta, muçarela, Acompanha Batata frita maravilhosa!', true, '/src/assets/bacon-cheddar-burger.jpg'),
('BUGUER VIP', 26.00, (SELECT id FROM categorias WHERE nome = 'ARTESANAIS'), 'Pão Brioche, Blend Bovino 140g ao ponto, com bastate Catupiry e muçarela. Acampanha uma deliciosa batata frita.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('BURGUER BACON ARTESANAL', 42.00, (SELECT id FROM categorias WHERE nome = 'ARTESANAIS'), 'Pão Brioche, duplo Bacon, Blend Bovino ao ponto(2x) 140g, Cheddar e Maionese. Acompanha uma deliciosa batata frita.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('PISCINA DE CHEDDAR', 30.00, (SELECT id FROM categorias WHERE nome = 'ARTESANAIS'), 'Pão Brioche, Bacon picadinhos, Blend Bovino 140g, Cebola Caramelizada e uma piscina recheada do melhor cheddar. (01 Lanche partido no meio) Acompanha uma deliciosa batata frita.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('RIBS BUGUER', 31.00, (SELECT id FROM categorias WHERE nome = 'ARTESANAIS'), 'Pão Brioche, Bacon, Banana Da Terra, Blend Bovino 140g, Cebola Caramelizada, muçarela e Molho Especial. Acompanha uma deliciosa batata frita.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X FURACÃO', 50.00, (SELECT id FROM categorias WHERE nome = 'ARTESANAIS'), 'Pão Brioche, 3x Burger De 140g (420gr Total), 3 Queijos (muçarela, Cheddar E Catupiry), Bacon (Burger Cremoso, Mega Saboroso Feito Na Chapa!) Acompanha uma deliciosa batata frita.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X TSUNAMI', 42.00, (SELECT id FROM categorias WHERE nome = 'ARTESANAIS'), 'Pão Brioche com 2 burgers de 130g (260g no total), presunto, muçarela, bacon, ovo e maionese especial da casa. (O Burger Cabuloso, mega saboroso, feito na chapa!) Acompanha uma irresistível porção de batata frita.', true, '/src/assets/bacon-cheddar-burger.jpg'),
('X TUDO ARTESANAL', 32.00, (SELECT id FROM categorias WHERE nome = 'ARTESANAIS'), 'Pão Brioche, bacon, Blend Bovino 140g, muçarela, Ovo e Presunto e Maionese da casa. Acompanha uma deliciosa batata frita.', true, '/src/assets/bacon-cheddar-burger.jpg')

ON CONFLICT (nome) DO NOTHING;