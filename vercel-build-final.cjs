#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 SOLUÇÃO FINAL - Build Definitivo para Vercel...');

try {
  // 1. Configurar ambiente
  console.log('⚙️ Configurando ambiente...');
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
  process.env.NPM_CONFIG_OPTIONAL = 'false';
  process.env.NPM_CONFIG_FUND = 'false';
  process.env.NPM_CONFIG_AUDIT = 'false';

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

  // 4. Instalar Rollup específico para Linux (apenas no Vercel)
  console.log('🔧 Instalando Rollup para Linux...');
  try {
    // Tentar instalar apenas se estivermos no Linux
    if (process.platform === 'linux') {
      execSync('npm install @rollup/rollup-linux-x64-gnu@4.9.6 --save-dev --no-audit --no-fund', { stdio: 'inherit' });
    } else {
      console.log('⚠️ Não é Linux, pulando instalação específica do Rollup');
    }
  } catch (e) {
    console.log('⚠️ Erro ao instalar Rollup específico, continuando...');
  }

  // 5. Verificar se Vite está funcionando
  console.log('🔍 Verificando Vite...');
  try {
    execSync('npx vite --version', { stdio: 'inherit' });
  } catch (e) {
    console.log('⚠️ Reinstalando Vite...');
    execSync('npm install vite@5.4.10 --save-dev --no-audit --no-fund', { stdio: 'inherit' });
  }

  // 6. Tentar build com diferentes estratégias
  console.log('🔨 Executando build com estratégia robusta...');
  
  // Estratégia 1: Build com configuração específica do Vercel
  try {
    execSync('npm run build:vercel', { stdio: 'inherit' });
    console.log('✅ Build com configuração Vercel funcionou!');
  } catch (e) {
    console.log('⚠️ Build Vercel falhou, tentando estratégia alternativa...');
    
    // Estratégia 2: Build normal
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log('✅ Build normal funcionou!');
    } catch (e2) {
      console.log('⚠️ Build normal falhou, tentando estratégia final...');
      
      // Estratégia 3: Build com Vite direto
      try {
        execSync('npx vite build --mode production --minify esbuild', { stdio: 'inherit' });
        console.log('✅ Build com Vite direto funcionou!');
      } catch (e3) {
        console.log('❌ Todas as estratégias falharam');
        throw e3;
      }
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
