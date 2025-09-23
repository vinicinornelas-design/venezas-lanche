#!/bin/bash

# Script para verificar se o deploy de teste funcionou
echo "🧪 Verificando deploy de teste..."

# Verificar último commit
echo "📝 Último commit enviado:"
git log --oneline -1

echo ""
echo "⏱️ Aguarde 2-3 minutos e verifique:"
echo "🌐 Site: https://venezas-lanche.vercel.app"
echo "📊 Dashboard: https://vercel.com/dashboard"
echo ""

# Verificar se conseguimos acessar o site
echo "🔍 Testando acesso ao site..."
response=$(curl -s -o /dev/null -w "%{http_code}" "https://venezas-lanche.vercel.app")

if [ "$response" = "200" ]; then
    echo "✅ Site acessível! (Status: $response)"
    echo "🎯 Deploy funcionando!"
else
    echo "❌ Site com problemas (Status: $response)"
    echo "⏳ Aguarde mais alguns minutos..."
fi

echo ""
echo "📊 Status do Vercel:"
echo "- Se o site carregar: ✅ Deploy funcionando"
echo "- Se não carregar: ⏳ Ainda processando"
echo "- Se erro 404: ❌ Deploy falhou"
