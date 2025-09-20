#!/bin/bash
set -e

echo "🚀 Iniciando build para Vercel..."

# Limpar cache do npm
npm cache clean --force

# Remover node_modules e package-lock.json se existirem
rm -rf node_modules package-lock.json

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

# Fazer build
echo "🔨 Executando build..."
npm run build

echo "✅ Build concluído com sucesso!"
