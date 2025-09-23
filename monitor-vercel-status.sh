#!/bin/bash

# Script para monitorar status do Vercel
echo "🔍 Monitorando status do Vercel..."
echo "📊 Acesse: https://vercel-status.com"
echo ""

while true; do
    echo "⏰ $(date +%H:%M:%S) - Verificando status..."
    
    # Verificar se conseguimos acessar a API do Vercel
    response=$(curl -s -o /dev/null -w "%{http_code}" "https://api.vercel.com/v1/user" -H "Authorization: Bearer 7yehJvgaWaEUaxfZHmZRIgCR")
    
    if [ "$response" = "200" ]; then
        echo "✅ Vercel API funcionando! (Status: $response)"
        echo "🚀 Deploy deve funcionar agora!"
        break
    else
        echo "❌ Vercel API com problemas (Status: $response)"
        echo "⏳ Aguardando 30 segundos..."
        sleep 30
    fi
done

echo ""
echo "🎯 Quando o Vercel voltar ao normal:"
echo "1. Os deploys automáticos funcionarão"
echo "2. Nossos commits já estão no GitHub"
echo "3. O site será atualizado automaticamente"
