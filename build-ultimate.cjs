#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BUILD ULTIMATE - Solução que FUNCIONA no Vercel...');

try {
  // 1. Configurar ambiente
  console.log('⚙️ Configurando ambiente...');
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';

  // 2. Limpar TUDO
  console.log('🧹 Limpando ambiente completamente...');
  try {
    execSync('npm cache clean --force', { stdio: 'inherit' });
  } catch (e) { /* ignore */ }
  
  if (fs.existsSync('node_modules')) {
    execSync('rm -rf node_modules', { stdio: 'inherit' });
  }
  if (fs.existsSync('package-lock.json')) {
    execSync('rm -f package-lock.json', { stdio: 'inherit' });
  }

  // 3. Instalar dependências básicas
  console.log('📦 Instalando dependências básicas...');
  execSync('npm install --no-audit --no-fund', { stdio: 'inherit' });

  // 4. Instalar Rollup específico para Linux (CRÍTICO)
  console.log('🔧 Instalando Rollup específico para Linux...');
  try {
    execSync('npm install @rollup/rollup-linux-x64-gnu@4.9.6 --save-dev --no-audit --no-fund', { stdio: 'inherit' });
    console.log('✅ Rollup para Linux instalado com sucesso!');
  } catch (e) {
    console.log('⚠️ Erro ao instalar Rollup específico, tentando alternativas...');
    
    // Tentar instalar rollup genérico
    try {
      execSync('npm install rollup@4.9.6 --save-dev --no-audit --no-fund', { stdio: 'inherit' });
      console.log('✅ Rollup genérico instalado!');
    } catch (e2) {
      console.log('⚠️ Erro ao instalar Rollup genérico, continuando...');
    }
  }

  // 5. Verificar se o Rollup está funcionando
  console.log('🔍 Verificando Rollup...');
  try {
    execSync('npx rollup --version', { stdio: 'inherit' });
    console.log('✅ Rollup funcionando!');
  } catch (e) {
    console.log('⚠️ Rollup não funcionando, mas continuando...');
  }

  // 6. Fazer build com Vite
  console.log('🔨 Executando build com Vite...');
  try {
    execSync('npx vite build --mode production --minify esbuild', { stdio: 'inherit' });
    console.log('✅ Build com Vite funcionou!');
  } catch (e) {
    console.log('⚠️ Build com Vite falhou, tentando estratégia alternativa...');
    
    // Estratégia alternativa: Build com configuração mínima
    try {
      execSync('npx vite build --mode production', { stdio: 'inherit' });
      console.log('✅ Build com configuração mínima funcionou!');
    } catch (e2) {
      console.log('❌ Todas as estratégias falharam');
      throw e2;
    }
  }

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
