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
      },
    },
  },
  preview: {
    port: 8080,
    strictPort: true,
  },
});