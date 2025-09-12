-- Teste simples para verificar se as imagens funcionam
-- Vamos usar apenas as imagens que sabemos que existem

-- Primeiro, vamos limpar e usar apenas imagens que existem
UPDATE itens_cardapio 
SET foto_url = '/acai-bowl.jpg' 
WHERE nome = 'AÇAI NO COPO';

UPDATE itens_cardapio 
SET foto_url = '/bacon-cheddar-burger.jpg' 
WHERE nome = 'BACON CHEDDAR';

UPDATE itens_cardapio 
SET foto_url = '/misto-sandwich.jpg' 
WHERE nome = 'MISTO';

UPDATE itens_cardapio 
SET foto_url = '/smash-burger.jpg' 
WHERE nome = 'SMASH CLÁSSICO';

-- Verificar se as imagens foram atualizadas
SELECT nome, foto_url 
FROM itens_cardapio 
WHERE foto_url IS NOT NULL 
ORDER BY nome;
