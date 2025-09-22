#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Build simplificado para Vercel...');

try {
  // 1. Configurar ambiente
  process.env.NODE_OPTIONS = '--max-old-space-size=4096';
  process.env.VITE_CHUNK_SIZE_WARNING_LIMIT = '0';

  // 2. Instalar dependências se necessário
  if (!fs.existsSync('node_modules')) {
    console.log('📦 Instalando dependências...');
    execSync('npm ci --no-audit --no-fund', { stdio: 'inherit' });
  }

  // 3. Build com configuração otimizada
  console.log('🔨 Executando build...');
  execSync('npm run build', { stdio: 'inherit' });

  // 4. Verificar se o build foi criado
  if (fs.existsSync('dist/index.html')) {
    console.log('✅ Build concluído com sucesso!');
    console.log('📁 Arquivos gerados:');
    const distFiles = fs.readdirSync('dist');
    distFiles.forEach(file => {
      const filePath = `dist/${file}`;
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