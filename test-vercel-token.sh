#!/bin/bash

# Script para testar token do Vercel
# Uso: ./test-vercel-token.sh SEU_TOKEN_AQUI

if [ -z "$1" ]; then
    echo "❌ Erro: Token não fornecido"
    echo "Uso: ./test-vercel-token.sh SEU_TOKEN_AQUI"
    exit 1
fi

TOKEN="$1"
echo "🔑 Testando token do Vercel..."

# Testar se o token é válido
echo "📡 Verificando token..."
RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" https://api.vercel.com/v1/user)

if echo "$RESPONSE" | grep -q "error"; then
    echo "❌ Token inválido ou expirado"
    echo "Resposta: $RESPONSE"
    exit 1
else
    echo "✅ Token válido!"
    echo "📊 Informações da conta:"
    echo "$RESPONSE" | jq '.'
fi

# Listar projetos
echo "📋 Listando projetos..."
PROJECTS=$(curl -s -H "Authorization: Bearer $TOKEN" https://api.vercel.com/v1/projects)
echo "$PROJECTS" | jq '.projects[] | {name: .name, id: .id}'

echo "🎉 Token funcionando corretamente!"
echo "💡 Agora você pode usar este token para deploy automático"
