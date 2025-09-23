#!/bin/bash

# Script para deploy com novo token
TOKEN="7yehJvgaWaEUaxfZHmZRIgCR"
PROJECT_ID="prj_Tth8TuEoHgPSe3xShb0oIOkWd3Bv"

echo "🚀 Deploy com novo token do Vercel..."

# Verificar se o token está funcionando
echo "🔑 Verificando novo token..."
USER_INFO=$(curl -s -H "Authorization: Bearer $TOKEN" https://api.vercel.com/v1/user)
if echo "$USER_INFO" | grep -q "error"; then
    echo "❌ Token inválido"
    exit 1
fi
echo "✅ Token válido!"

# Criar arquivo para forçar mudança
echo "Deploy com novo token em $(date)" > deploy-novo-token-$(date +%s).txt

# Commit e push
git add .
git commit -m "🚀 DEPLOY NOVO TOKEN - $(date)"
git push origin main

echo "✅ Push realizado com novo token!"
echo "⏱️ Aguarde 2-3 minutos para verificar no dashboard Vercel"
echo "🌐 Acesse: https://venezas-lanche.vercel.app"
echo "📊 Dashboard: https://vercel.com/dashboard"
