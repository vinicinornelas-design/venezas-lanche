import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 0, // Desabilita completamente o warning
    rollupOptions: {
      output: {
        manualChunks: undefined, // Desabilita divisão manual de chunks
        // Força o Vite a não gerar warnings de chunk size
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    // Configurações adicionais para evitar warnings
    minify: 'esbuild',
    sourcemap: false,
    // Força o build a não falhar por chunk size
    reportCompressedSize: false,
  },
  preview: {
    port: 8080,
    strictPort: true,
  },
  // Configuração para suprimir warnings específicos
  logLevel: 'warn',
});
