#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BUILD VITE SEM ROLLUP - Solução que FUNCIONA no Vercel...');

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

  // 4. Criar configuração Vite que funciona
  console.log('📝 Criando configuração Vite que funciona...');
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
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          utils: ['date-fns', 'lucide-react']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  base: "/",
  optimizeDeps: {
    include: ['react', 'react-dom', 'jspdf', 'html2canvas']
  }
});
`;

  fs.writeFileSync('vite.config.working.ts', viteConfig);

  // 5. Executar build com Vite
  console.log('🔨 Executando build com Vite...');
  try {
    execSync('npx vite build --config vite.config.working.ts --mode production', { stdio: 'inherit' });
    console.log('✅ Build com Vite funcionou!');
  } catch (e) {
    console.log('⚠️ Build com Vite falhou, tentando estratégia alternativa...');
    
    // Estratégia alternativa: Build com configuração mínima
    try {
      console.log('🔨 Tentando build com configuração mínima...');
      execSync('npx vite build --mode production --minify esbuild --outDir dist', { stdio: 'inherit' });
      console.log('✅ Build com configuração mínima funcionou!');
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
