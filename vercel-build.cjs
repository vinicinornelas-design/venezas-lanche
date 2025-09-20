#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Iniciando build ultra robusto para Vercel...');

try {
  // 1. Configurar npm para evitar warnings
  console.log('⚙️ Configurando npm...');
  execSync('npm config set fund false', { stdio: 'inherit' });
  execSync('npm config set audit false', { stdio: 'inherit' });
  
  // 2. Limpar cache do npm
  console.log('🧹 Limpando cache do npm...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  // 3. Remover node_modules e package-lock.json
  console.log('🗑️ Removendo dependências antigas...');
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  if (fs.existsSync('package-lock.json')) {
    execSync('rm -f package-lock.json', { stdio: 'inherit' });
  }

  // 4. Instalar dependências
  console.log('📦 Instalando dependências...');
  execSync('npm install --no-audit --no-fund --omit=optional --silent', { stdio: 'inherit' });

  // 5. Verificar se o Rollup está funcionando
  console.log('🔍 Verificando Rollup...');
  try {
    execSync('npx rollup --version', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Rollup não encontrado, instalando...');
    execSync('npm install rollup@4.9.6 --save-dev', { stdio: 'inherit' });
  }

  // 6. Fazer build
  console.log('🔨 Executando build...');
  execSync('npm run build', { stdio: 'inherit' });

  // 7. Verificar se o build foi criado
  if (fs.existsSync('dist/index.html')) {
    console.log('✅ Build concluído com sucesso!');
    console.log('📁 Arquivos gerados:');
    const distFiles = fs.readdirSync('dist');
    distFiles.forEach(file => {
      const filePath = path.join('dist', file);
      const stats = fs.statSync(filePath);
      if (stats.isFile()) {
        console.log(`   - ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      }
    });
  } else {
    throw new Error('Build falhou - dist/index.html não foi criado');
  }

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
