#!/bin/bash
# Script para commit e push automático

echo "📝 Adicionando todas as alterações..."
git add .

echo "💾 Fazendo commit com mensagem: $1"
git commit -m "$1"

echo "🚀 Fazendo push..."
git push

if [ $? -eq 0 ]; then
    echo "✅ Tudo enviado com sucesso!"
else
    echo "❌ Erro no push. Verifique as credenciais."
fi
