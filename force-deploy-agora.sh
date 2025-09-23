#!/bin/bash

# Script para forçar deploy AGORA
TOKEN="7yehJvgaWaEUaxfZHmZRIgCR"

echo "🚀 FORÇANDO DEPLOY AGORA..."

# Criar mudança forçada
echo "Deploy forçado em $(date)" > force-deploy-$(date +%s).txt

# Commit e push
git add .
git commit -m "🚀 FORÇAR DEPLOY AGORA - $(date +%H:%M:%S)"
git push origin main

echo "✅ Push realizado!"
echo "⏱️ Aguarde 1-2 minutos e verifique:"
echo "🌐 https://venezas-lanche.vercel.app"
echo "📊 https://vercel.com/dashboard"

# Verificar status em 30 segundos
echo "⏳ Aguardando 30 segundos para verificar..."
sleep 30

echo "🔍 Verificando último commit:"
git log --oneline -1

echo "📊 Verifique manualmente no dashboard Vercel se o deploy apareceu!"
