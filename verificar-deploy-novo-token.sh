#!/bin/bash

# Script para verificar deploy com novo token
TOKEN="7yehJvgaWaEUaxfZHmZRIgCR"
PROJECT_ID="prj_Tth8TuEoHgPSe3xShb0oIOkWd3Bv"

echo "🔍 Verificando deploy com novo token..."

# Verificar último commit no GitHub
echo "📝 Último commit no GitHub:"
git log --oneline -1

# Verificar último deploy no Vercel
echo "🚀 Último deploy no Vercel:"
curl -s -H "Authorization: Bearer $TOKEN" "https://api.vercel.com/v1/projects/$PROJECT_ID" | grep -o '"githubCommitSha":"[^"]*"' | head -1

# Verificar se há deploys em andamento
echo "⏳ Verificando deploys em andamento..."
curl -s -H "Authorization: Bearer $TOKEN" "https://api.vercel.com/v1/projects/$PROJECT_ID" | grep -o '"readyState":"[^"]*"' | head -3

echo ""
echo "📊 Status:"
echo "- Se os commits coincidirem: ✅ Deploy funcionando"
echo "- Se não coincidirem: ❌ Ainda há problema de webhook"
echo "- Se aparecer 'BUILDING': ⏳ Deploy em andamento"
