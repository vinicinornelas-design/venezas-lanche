#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 BUILD WEBPACK SOLUTION - Solução que FUNCIONA no Vercel...');

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

  // 4. Instalar Webpack e dependências específicas
  console.log('🔧 Instalando Webpack e dependências específicas...');
  try {
    // Instalar Webpack
    execSync('npm install webpack webpack-cli webpack-dev-server --save-dev --no-audit --no-fund', { stdio: 'inherit' });
    console.log('✅ Webpack instalado!');
  } catch (e) {
    console.log('⚠️ Erro ao instalar Webpack, continuando...');
  }

  // 5. Criar configuração Webpack personalizada
  console.log('📝 Criando configuração Webpack...');
  const webpackConfig = `
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  mode: 'production',
  entry: './src/main.tsx',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'assets/[name].[contenthash].js',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  module: {
    rules: [
      {
        test: /\\.(ts|tsx)$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\\.(png|jpg|jpeg|gif|svg)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name].[contenthash][ext]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
    }),
    new MiniCssExtractPlugin({
      filename: 'assets/[name].[contenthash].css',
    }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\\\/]node_modules[\\\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  performance: {
    hints: false,
  },
};
`;

  fs.writeFileSync('webpack.config.js', webpackConfig);

  // 6. Instalar dependências do Webpack
  console.log('📦 Instalando dependências do Webpack...');
  try {
    execSync('npm install html-webpack-plugin mini-css-extract-plugin css-loader postcss-loader ts-loader --save-dev --no-audit --no-fund', { stdio: 'inherit' });
    console.log('✅ Dependências do Webpack instaladas!');
  } catch (e) {
    console.log('⚠️ Erro ao instalar dependências do Webpack, continuando...');
  }

  // 7. Executar build com Webpack
  console.log('🔨 Executando build com Webpack...');
  try {
    execSync('npx webpack --config webpack.config.js', { stdio: 'inherit' });
    console.log('✅ Build com Webpack funcionou!');
  } catch (e) {
    console.log('❌ Build com Webpack falhou, tentando estratégia alternativa...');
    
    // Estratégia alternativa: Build simples com Vite sem Rollup
    try {
      console.log('🔨 Tentando build simples com Vite...');
      execSync('npx vite build --mode production --minify esbuild --outDir dist', { stdio: 'inherit' });
      console.log('✅ Build simples com Vite funcionou!');
    } catch (e2) {
      console.log('❌ Todas as estratégias falharam');
      throw e2;
    }
  }

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
