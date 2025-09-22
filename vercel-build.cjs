#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const os = require('os');

console.log('🚀 Iniciando build para Vercel...');
console.log(`📋 Plataforma: ${os.platform()} ${os.arch()}`);

try {
  // 1. Configurar ambiente
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
  process.env.VITE_CHUNK_SIZE_WARNING_LIMIT = '0';

  // 2. Instalar dependências se necessário
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Instalando dependências...');
    execSync('npm ci --no-audit --no-fund', { stdio: 'inherit' });
  }

  // 3. Instalar dependências específicas de plataforma
  console.log('🔧 Instalando dependências específicas de plataforma...');
  try {
    if (os.platform() === 'linux' && os.arch() === 'x64') {
      console.log('🐧 Instalando dependências para Linux x64...');
      execSync('npm install @rollup/rollup-linux-x64-gnu@4.9.6 --save-dev --no-audit --no-fund', { stdio: 'inherit' });
    } else if (os.platform() === 'darwin' && os.arch() === 'arm64') {
      console.log('🍎 Instalando dependências para macOS ARM64...');
      execSync('npm install @rollup/rollup-darwin-arm64@4.52.0 --save-dev --no-audit --no-fund', { stdio: 'inherit' });
    } else if (os.platform() === 'darwin' && os.arch() === 'x64') {
      console.log('🍎 Instalando dependências para macOS x64...');
      execSync('npm install @rollup/rollup-darwin-x64@4.52.0 --save-dev --no-audit --no-fund', { stdio: 'inherit' });
    } else if (os.platform() === 'win32') {
      console.log('🪟 Instalando dependências para Windows...');
      execSync('npm install @rollup/rollup-win32-x64-msvc@4.52.0 --save-dev --no-audit --no-fund', { stdio: 'inherit' });
    }
  } catch (error) {
    console.log('⚠️  Aviso: Não foi possível instalar dependências específicas de plataforma');
    console.log('📝 Continuando com build...');
  }

  // 4. Executar build
  console.log('🔨 Executando build...');
  execSync('npm run build', { stdio: 'inherit' });

  // 5. Verificar se o build foi criado
  if (fs.existsSync('dist/index.html')) {
    console.log('✅ Build concluído com sucesso!');
    console.log('📁 Arquivos gerados:');
    const distFiles = fs.readdirSync('dist');
    distFiles.forEach(file => {
      const stats = fs.statSync(`dist/${file}`);
      if (stats.isFile()) {
        console.log(`   📄 ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
      } else {
        console.log(`   📁 ${file}/`);
      }
    });
  } else {
    throw new Error('❌ Build falhou - arquivo dist/index.html não encontrado');
  }

} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}