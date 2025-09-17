import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    chunkSizeWarningLimit: 0, // Desabilita o warning
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Separa node_modules em chunks menores
          if (id.includes('node_modules')) {
            // React e React DOM
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Radix UI components
            if (id.includes('@radix-ui')) {
              return 'radix-ui';
            }
            // Charts
            if (id.includes('recharts')) {
              return 'charts';
            }
            // PDF libraries
            if (id.includes('jspdf') || id.includes('html2canvas')) {
              return 'pdf-libs';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // TanStack Query
            if (id.includes('@tanstack')) {
              return 'tanstack';
            }
            // Lucide icons
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Date libraries
            if (id.includes('date-fns')) {
              return 'date-utils';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'forms';
            }
            // Router
            if (id.includes('react-router')) {
              return 'router';
            }
            // Other utilities
            return 'vendor';
          }
          
          // Separa páginas grandes em chunks separados
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1]?.split('.')[0];
            if (pageName && ['Dashboard', 'AdminDashboard', 'Pedidos', 'Mesas', 'Financeiro'].includes(pageName)) {
              return `page-${pageName.toLowerCase()}`;
            }
          }
        },
      },
    },
  },
  preview: {
    port: 8080,
    strictPort: true,
  },
}));
