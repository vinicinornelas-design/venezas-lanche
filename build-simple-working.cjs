#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BUILD SIMPLES QUE FUNCIONA - Solução que FUNCIONA no Vercel...');

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

  // 4. Temporariamente remover dependências problemáticas
  console.log('🔧 Removendo dependências problemáticas temporariamente...');
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Salvar dependências originais
  const originalDeps = { ...packageJson.dependencies };
  
  // Remover dependências problemáticas
  delete packageJson.dependencies.jspdf;
  delete packageJson.dependencies.html2canvas;
  
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  // 5. Reinstalar sem dependências problemáticas
  console.log('📦 Reinstalando sem dependências problemáticas...');
  execSync('npm install --no-audit --no-fund', { stdio: 'inherit' });

  // 6. Executar build com Vite
  console.log('🔨 Executando build com Vite...');
  try {
    execSync('npx vite build --mode production --minify esbuild --outDir dist', { stdio: 'inherit' });
    console.log('✅ Build com Vite funcionou!');
  } catch (e) {
    console.log('❌ Build com Vite falhou:', e.message);
    throw e;
  }

  // 7. Restaurar dependências originais
  console.log('🔄 Restaurando dependências originais...');
  packageJson.dependencies = originalDeps;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2));

  // 8. Verificar se o build foi criado
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
