# 📸 Instruções para Atualizar Fotos do Cardápio

## 🎯 Objetivo
Atualizar as fotos dos itens do cardápio baseado nas imagens disponíveis na pasta `public/`.

## 📋 Passos para Executar

### 1. Acessar o Supabase Dashboard
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Acesse o projeto do Veneza's Lanches
4. Vá para **SQL Editor**

### 2. Executar o Script SQL
Copie e cole o conteúdo do arquivo `atualizar_fotos_cardapio.sql` no SQL Editor e execute.

### 3. Verificar os Resultados
Após executar o script, verifique se as fotos foram atualizadas corretamente.

## 🗂️ Mapeamento de Imagens

### 🍔 Hambúrgueres e Lanches
- **BACON BURGUER.png** → Itens com "BACON BURGUER"
- **BUGUER CEBOLA.png** → Itens com "CEBOLA" ou "ONION"
- **BUGUER CREMOSO.png** → Itens com "CREMOSO" ou "CREAMY"
- **BUGUER PICANTE.png** → Itens com "PICANTE" ou "SPICY"
- **BUGUER VIP.png** → Itens com "VIP" ou "PREMIUM"
- **BURGUER BACON ARTESANAL.png** → Itens com "BACON ARTESANAL"
- **BURGUER COSTELA.png** → Itens com "COSTELA" ou "RIBS"
- **RIBS BUGUER.png** → Itens com "RIBS" ou "COSTELA"
- **X FURACÃO.png** → Itens com "FURACÃO"
- **X TSUNAMI.png** → Itens com "TSUNAMI"
- **X TUDO ARTESANAL.png** → Itens com "X TUDO"
- **smash-burger.jpg** → Itens com "SMASH"

### 🍟 Batatas Fritas
- **bata(mini).jpeg** → Batata Mini
- **batat media.jpeg** → Batata Média
- **batata grande.jpeg** → Batata Grande
- **batata extra grande.jpeg** → Batata Extra Grande
- **batata master.jpeg** → Batata Master
- **batata mini especias.jpeg** → Batata Mini Especial
- **PISCINA DE CHEDDAR.png** → Itens com "PISCINA" ou "CHEDDAR"

### 🥚 Omeletes
- **OMELETÃO.png** → Omeletão
- **OMELETE GRANDE.png** → Omelete Grande
- **OMELETE PEQUENO.png** → Omelete Pequeno

### 🥪 Lanches Tradicionais
- **misto-sandwich.jpg** → Misto (sem bacon)
- **bacon-cheddar-burger.jpg** → Bacon Cheddar
- **burger-egg.jpg** → Itens com ovo
- **burger-hawaii.jpg** → Itens com abacaxi
- **burger-pulled-beef.jpg** → Carne desfiada
- **burger-triplo.jpg** → Lanches triplos

### 🍧 Sobremesas
- **acai-bowl.jpg** → Açaí
- **crepes-recheados.jpg** → Crepes

## ✅ Verificação
Após executar o script, verifique se:
1. As fotos foram atualizadas corretamente
2. Os itens do cardápio agora mostram as imagens corretas
3. Não há itens sem foto

## 🔄 Próximos Passos
1. Testar o cardápio no frontend
2. Verificar se as imagens carregam corretamente
3. Ajustar mapeamentos se necessário
