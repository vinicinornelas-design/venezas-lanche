#!/bin/bash

# Script para verificar status do webhook
TOKEN="z3GHixXVdrFADez1JgCRcOAr"
PROJECT_ID="prj_Tth8TuEoHgPSe3xShb0oIOkWd3Bv"

echo "🔍 Verificando status do webhook..."

# Verificar último commit no GitHub
echo "📝 Último commit no GitHub:"
git log --oneline -1

# Verificar último deploy no Vercel
echo "🚀 Último deploy no Vercel:"
curl -s -H "Authorization: Bearer $TOKEN" "https://api.vercel.com/v1/projects/$PROJECT_ID" | grep -o '"githubCommitSha":"[^"]*"' | head -1

echo ""
echo "⏱️ Aguarde 2-3 minutos e execute novamente para verificar se o deploy apareceu"
