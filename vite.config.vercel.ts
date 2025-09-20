import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
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
    chunkSizeWarningLimit: 0,
    rollupOptions: {
      external: [],
      output: {
        manualChunks: undefined,
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    minify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: false,
    logLevel: 'warn',
    target: 'es2020'
  },
  base: "/",
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['@rollup/rollup-linux-x64-gnu']
  },
  esbuild: {
    target: 'es2020'
  }
});
