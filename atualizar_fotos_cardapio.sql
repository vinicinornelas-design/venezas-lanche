-- =====================================================
-- SCRIPT PARA ATUALIZAR FOTOS DO CARDÁPIO
-- Baseado nas imagens disponíveis na pasta public/
-- =====================================================

-- 🍔 HAMBÚRGUERES E LANCHES ESPECIAIS
UPDATE itens_cardapio 
SET foto_url = '/BACON BURGUER.png' 
WHERE nome ILIKE '%BACON BURGUER%' OR nome ILIKE '%BACON BURGER%';

UPDATE itens_cardapio 
SET foto_url = '/BUGUER CEBOLA.png' 
WHERE nome ILIKE '%CEBOLA%' OR nome ILIKE '%ONION%';

UPDATE itens_cardapio 
SET foto_url = '/BUGUER CREMOSO.png' 
WHERE nome ILIKE '%CREMOSO%' OR nome ILIKE '%CREAMY%';

UPDATE itens_cardapio 
SET foto_url = '/BUGUER PICANTE.png' 
WHERE nome ILIKE '%PICANTE%' OR nome ILIKE '%SPICY%';

UPDATE itens_cardapio 
SET foto_url = '/BUGUER VIP.png' 
WHERE nome ILIKE '%VIP%' OR nome ILIKE '%PREMIUM%';

UPDATE itens_cardapio 
SET foto_url = '/BURGUER BACON ARTESANAL.png' 
WHERE nome ILIKE '%BACON ARTESANAL%' OR nome ILIKE '%ARTESANAL%';

UPDATE itens_cardapio 
SET foto_url = '/BURGUER COSTELA.png' 
WHERE nome ILIKE '%COSTELA%' OR nome ILIKE '%RIBS%';

UPDATE itens_cardapio 
SET foto_url = '/RIBS BUGUER.png' 
WHERE nome ILIKE '%RIBS%' OR nome ILIKE '%COSTELA%';

UPDATE itens_cardapio 
SET foto_url = '/X FURACÃO.png' 
WHERE nome ILIKE '%FURACÃO%' OR nome ILIKE '%FURACAO%';

UPDATE itens_cardapio 
SET foto_url = '/X TSUNAMI.png' 
WHERE nome ILIKE '%TSUNAMI%';

UPDATE itens_cardapio 
SET foto_url = '/X TUDO ARTESANAL.png' 
WHERE nome ILIKE '%X TUDO%' OR nome ILIKE '%TUDO%';

UPDATE itens_cardapio 
SET foto_url = '/smash-burger.jpg' 
WHERE nome ILIKE '%SMASH%' OR nome ILIKE '%SMASH BURGUER%';

-- 🍟 BATATAS FRITAS
UPDATE itens_cardapio 
SET foto_url = '/bata(mini).jpeg' 
WHERE nome ILIKE '%BATATA MINI%' OR nome ILIKE '%MINI%';

UPDATE itens_cardapio 
SET foto_url = '/batat media.jpeg' 
WHERE nome ILIKE '%BATATA MÉDIA%' OR nome ILIKE '%BATATA MEDIA%' OR nome ILIKE '%MÉDIA%' OR nome ILIKE '%MEDIA%';

UPDATE itens_cardapio 
SET foto_url = '/batata grande.jpeg' 
WHERE nome ILIKE '%BATATA GRANDE%' OR nome ILIKE '%GRANDE%';

UPDATE itens_cardapio 
SET foto_url = '/batata extra grande.jpeg' 
WHERE nome ILIKE '%BATATA EXTRA GRANDE%' OR nome ILIKE '%EXTRA GRANDE%';

UPDATE itens_cardapio 
SET foto_url = '/batata master.jpeg' 
WHERE nome ILIKE '%BATATA MASTER%' OR nome ILIKE '%MASTER%';

UPDATE itens_cardapio 
SET foto_url = '/batata mini especias.jpeg' 
WHERE nome ILIKE '%BATATA MINI ESPECIAL%' OR nome ILIKE '%MINI ESPECIAL%' OR nome ILIKE '%ESPECIAL%';

UPDATE itens_cardapio 
SET foto_url = '/PISCINA DE CHEDDAR.png' 
WHERE nome ILIKE '%PISCINA%' OR nome ILIKE '%CHEDDAR%' OR nome ILIKE '%QUEIJO%';

-- 🥚 OMELETES
UPDATE itens_cardapio 
SET foto_url = '/OMELETÃO.png' 
WHERE nome ILIKE '%OMELETÃO%' OR nome ILIKE '%OMELETAO%';

UPDATE itens_cardapio 
SET foto_url = '/OMELETE GRANDE.png' 
WHERE nome ILIKE '%OMELETE GRANDE%';

UPDATE itens_cardapio 
SET foto_url = '/OMELETE PEQUENO.png' 
WHERE nome ILIKE '%OMELETE PEQUENO%' OR nome ILIKE '%OMELETE PEQUENO%';

-- 🥪 LANCHES TRADICIONAIS
UPDATE itens_cardapio 
SET foto_url = '/misto-sandwich.jpg' 
WHERE nome ILIKE '%MISTO%' AND nome NOT ILIKE '%BACON%';

UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome ILIKE '%BACON CHEDDAR%' OR nome ILIKE '%CHEDDAR%';

UPDATE itens_cardapio 
SET foto_url = '/burger-egg.jpg' 
WHERE nome ILIKE '%OVO%' OR nome ILIKE '%EGG%';

UPDATE itens_cardapio 
SET foto_url = '/burger-hawaii.jpg' 
WHERE nome ILIKE '%HAWAII%' OR nome ILIKE '%ABACAXI%';

UPDATE itens_cardapio 
SET foto_url = '/burger-pulled-beef.jpg' 
WHERE nome ILIKE '%PULLED%' OR nome ILIKE '%DESFIADO%';

UPDATE itens_cardapio 
SET foto_url = '/burger-triplo.jpg' 
WHERE nome ILIKE '%TRIPLO%' OR nome ILIKE '%TRIPLE%';

-- 🍧 SOBREMESAS
UPDATE itens_cardapio 
SET foto_url = '/acai-bowl.jpg' 
WHERE nome ILIKE '%AÇAI%' OR nome ILIKE '%ACAI%';

-- 🥞 CREPES
UPDATE itens_cardapio 
SET foto_url = '/crepes-recheados.jpg' 
WHERE nome ILIKE '%CREPE%' OR nome ILIKE '%CREPES%';

-- =====================================================
-- VERIFICAÇÃO DOS RESULTADOS
-- =====================================================

-- Mostrar todos os itens com suas fotos atualizadas
SELECT 
    nome,
    foto_url,
    preco,
    (SELECT nome FROM categorias WHERE id = categoria_id) as categoria
FROM itens_cardapio 
WHERE ativo = true 
ORDER BY categoria, nome;

-- Verificar itens que ainda não têm foto ou têm foto antiga
SELECT 
    nome,
    foto_url,
    (SELECT nome FROM categorias WHERE id = categoria_id) as categoria
FROM itens_cardapio 
WHERE ativo = true 
AND (foto_url IS NULL OR foto_url = '' OR foto_url LIKE '/src/assets/%')
ORDER BY nome;
