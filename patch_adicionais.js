// Script para adicionar o botão "Gerenciar Adicionais" diretamente no HTML compilado
// Execute este script se não conseguir instalar o Node.js

const fs = require('fs');
const path = require('path');

// Caminho para o arquivo index.html
const indexPath = path.join(__dirname, 'index.html');

// Ler o arquivo index.html
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Adicionar o botão "Gerenciar Adicionais" antes do fechamento do body
const buttonHTML = `
  <script>
    // Aguardar o carregamento da página
    document.addEventListener('DOMContentLoaded', function() {
      // Aguardar um pouco mais para garantir que o React carregou
      setTimeout(function() {
        // Procurar pelo botão "Gerenciar Categorias"
        const categoriasButton = document.querySelector('button[class*="border-blue-200"]');
        
        if (categoriasButton) {
          // Criar o botão "Gerenciar Adicionais"
          const adicionaisButton = document.createElement('button');
          adicionaisButton.innerHTML = `
            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Gerenciar Adicionais
          `;
          adicionaisButton.className = 'px-4 py-2 bg-green-100 text-green-600 border border-green-200 rounded hover:bg-green-200 flex items-center';
          adicionaisButton.onclick = function() {
            alert('Funcionalidade de Gerenciar Adicionais\\n\\nPara usar esta funcionalidade completa, você precisa:\\n1. Instalar o Node.js\\n2. Executar: npm run dev\\n3. Acessar o sistema compilado');
          };
          
          // Inserir o botão antes do botão "Gerenciar Categorias"
          categoriasButton.parentNode.insertBefore(adicionaisButton, categoriasButton);
        }
      }, 2000);
    });
  </script>
`;

// Adicionar o script antes do fechamento do body
htmlContent = htmlContent.replace('</body>', buttonHTML + '</body>');

// Salvar o arquivo modificado
fs.writeFileSync(indexPath, htmlContent);

console.log('✅ Botão "Gerenciar Adicionais" adicionado ao index.html');
console.log('📝 Nota: Esta é uma solução temporária. Para funcionalidade completa, instale o Node.js');
