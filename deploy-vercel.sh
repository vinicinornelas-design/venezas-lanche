#!/bin/bash

# Script para fazer deploy no Vercel usando o token
TOKEN="z3GHixXVdrFADez1JgCRcOAr"
PROJECT_ID="prj_Tth8TuEoHgPSe3xShb0oIOkWd3Bv"

echo "🚀 Iniciando deploy no Vercel..."

# Verificar se o token está funcionando
echo "🔑 Verificando token..."
USER_INFO=$(curl -s -H "Authorization: Bearer $TOKEN" https://api.vercel.com/v1/user)
if echo "$USER_INFO" | grep -q "error"; then
    echo "❌ Token inválido"
    exit 1
fi
echo "✅ Token válido!"

# Fazer commit vazio para triggerar deploy
echo "📝 Criando commit vazio para triggerar deploy..."
git commit --allow-empty -m "🚀 Trigger Vercel deploy - $(date)"

# Push para GitHub
echo "📤 Fazendo push para GitHub..."
git push origin main

echo "✅ Deploy iniciado!"
echo "🌐 Acesse: https://venezas-lanche.vercel.app"
echo "📊 Dashboard: https://vercel.com/dashboard"
