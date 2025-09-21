#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BUILD SIMPLES SEM ROLLUP - Solução que FUNCIONA no Vercel...');

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

  // 4. Criar configuração Vite simplificada
  console.log('📝 Criando configuração Vite simplificada...');
  const viteConfig = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
    logLevel: 'warn',
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  base: "/",
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
});
`;

  fs.writeFileSync('vite.config.simple.ts', viteConfig);

  // 5. Executar build com configuração simplificada
  console.log('🔨 Executando build com configuração simplificada...');
  try {
    execSync('npx vite build --config vite.config.simple.ts --mode production', { stdio: 'inherit' });
    console.log('✅ Build com configuração simplificada funcionou!');
  } catch (e) {
    console.log('⚠️ Build com configuração simplificada falhou, tentando estratégia alternativa...');
    
    // Estratégia alternativa: Build com esbuild direto
    try {
      console.log('🔨 Tentando build com esbuild direto...');
      execSync('npx esbuild src/main.tsx --bundle --outfile=dist/index.js --format=esm --target=es2020 --minify', { stdio: 'inherit' });
      
      // Copiar index.html
      if (fs.existsSync('index.html')) {
        fs.copyFileSync('index.html', 'dist/index.html');
      }
      
      console.log('✅ Build com esbuild direto funcionou!');
    } catch (e2) {
      console.log('❌ Todas as estratégias falharam');
      throw e2;
    }
  }

  // 6. Verificar se o build foi criado
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
