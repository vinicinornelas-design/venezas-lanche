#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BUILD ESBUILD DIRETO - Solução que FUNCIONA no Vercel...');

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

  // 4. Instalar esbuild
  console.log('🔧 Instalando esbuild...');
  try {
    execSync('npm install esbuild --save-dev --no-audit --no-fund', { stdio: 'inherit' });
    console.log('✅ esbuild instalado!');
  } catch (e) {
    console.log('⚠️ Erro ao instalar esbuild, continuando...');
  }

  // 5. Criar diretório dist
  console.log('📁 Criando diretório dist...');
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }

  // 6. Copiar arquivos estáticos
  console.log('📋 Copiando arquivos estáticos...');
  if (fs.existsSync('index.html')) {
    fs.copyFileSync('index.html', 'dist/index.html');
  }
  if (fs.existsSync('public')) {
    execSync('cp -r public/* dist/', { stdio: 'inherit' });
  }

  // 7. Executar build com esbuild
  console.log('🔨 Executando build com esbuild...');
  try {
    // Build do main.tsx
    execSync('npx esbuild src/main.tsx --bundle --outfile=dist/assets/main.js --format=esm --target=es2020 --minify --sourcemap', { stdio: 'inherit' });
    
    // Build do CSS
    if (fs.existsSync('src/index.css')) {
      execSync('npx esbuild src/index.css --bundle --outfile=dist/assets/main.css --minify', { stdio: 'inherit' });
    }
    
    console.log('✅ Build com esbuild funcionou!');
  } catch (e) {
    console.log('❌ Build com esbuild falhou:', e.message);
    throw e;
  }

  // 8. Atualizar index.html para usar os arquivos corretos
  console.log('📝 Atualizando index.html...');
  if (fs.existsSync('dist/index.html')) {
    let htmlContent = fs.readFileSync('dist/index.html', 'utf8');
    
    // Substituir script src
    htmlContent = htmlContent.replace(
      /<script type="module" src="[^"]*"><\/script>/,
      '<script type="module" src="./assets/main.js"></script>'
    );
    
    // Adicionar CSS se existir
    if (fs.existsSync('dist/assets/main.css')) {
      htmlContent = htmlContent.replace(
        '</head>',
        '<link rel="stylesheet" href="./assets/main.css"></head>'
      );
    }
    
    fs.writeFileSync('dist/index.html', htmlContent);
  }

  // 9. Verificar se o build foi criado
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
