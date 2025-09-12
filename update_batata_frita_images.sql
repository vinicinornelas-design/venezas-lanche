-- Atualizar APENAS as batatas fritas com as imagens corretas
-- Usar as imagens específicas que o usuário enviou

-- BATATA FRITA (MINI) - imagem simples de batata frita
UPDATE itens_cardapio 
SET foto_url = '/batata-frita-mini.jpg' 
WHERE nome = 'BATATA FRITA (MINI)';

-- BATATA FRITA (MÉDIA) - imagem simples de batata frita
UPDATE itens_cardapio 
SET foto_url = '/batata-frita-media.jpg' 
WHERE nome = 'BATATA FRITA (MÉDIA)';

-- BATATA FRITA (GRANDE) - imagem simples de batata frita
UPDATE itens_cardapio 
SET foto_url = '/batata-frita-grande.jpg' 
WHERE nome = 'BATATA FRITA (GRANDE)';

-- BATATA FRITA (EXTRA GRANDE) - imagem simples de batata frita
UPDATE itens_cardapio 
SET foto_url = '/batata-frita-extra-grande.jpg' 
WHERE nome = 'BATATA FRITA (EXTRA GRANDE)';

-- BATATA FRITA (MINI ESPECIAL) - imagem com queijo e bacon
UPDATE itens_cardapio 
SET foto_url = '/batata-frita-mini-especial.jpg' 
WHERE nome = 'BATATA FRITA (MINI ESPECIAL)';

-- BATATA FRITA (MASTER) - imagem carregada com queijo e bacon
UPDATE itens_cardapio 
SET foto_url = '/batata-frita-master.jpg' 
WHERE nome = 'BATATA FRITA (MASTER)';

-- Verificar se as imagens foram atualizadas
SELECT nome, foto_url, preco
FROM itens_cardapio 
WHERE nome LIKE 'BATATA FRITA%'
ORDER BY preco;
