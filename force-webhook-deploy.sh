#!/bin/bash

# Script para forçar deploy via webhook
TOKEN="z3GHixXVdrFADez1JgCRcOAr"
PROJECT_ID="prj_Tth8TuEoHgPSe3xShb0oIOkWd3Bv"

echo "🚀 Forçando deploy via webhook..."

# Criar um arquivo temporário para forçar mudança
echo "Deploy forçado em $(date)" > force-deploy-$(date +%s).txt

# Commit e push
git add .
git commit -m "🚀 FORÇAR DEPLOY WEBHOOK - $(date)"
git push origin main

echo "✅ Push realizado!"
echo "⏱️ Aguarde 2-3 minutos para o deploy aparecer no Vercel"
echo "🌐 Acesse: https://venezas-lanche.vercel.app"
