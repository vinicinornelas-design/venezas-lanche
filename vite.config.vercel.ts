import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// Configuração específica para o Vercel
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
        manualChunks: (id) => {
          // Separa node_modules em chunks menores
          if (id.includes('node_modules')) {
            // React e React DOM
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // Radix UI components - separar por categoria
            if (id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-alert-dialog')) {
              return 'radix-dialogs';
            }
            if (id.includes('@radix-ui/react-dropdown-menu') || id.includes('@radix-ui/react-select')) {
              return 'radix-menus';
            }
            if (id.includes('@radix-ui/react-tabs') || id.includes('@radix-ui/react-accordion')) {
              return 'radix-layout';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-other';
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
            // Tailwind e CSS
            if (id.includes('tailwind') || id.includes('clsx') || id.includes('class-variance-authority')) {
              return 'css-utils';
            }
            // Other utilities
            return 'vendor';
          }
          
          // Separa páginas grandes em chunks separados
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1]?.split('.')[0];
            if (pageName && ['Dashboard', 'AdminDashboard', 'Pedidos', 'Mesas', 'Financeiro', 'Clientes', 'Funcionarios'].includes(pageName)) {
              return `page-${pageName.toLowerCase()}`;
            }
          }
          
          // Separa componentes grandes
          if (id.includes('/components/')) {
            const componentName = id.split('/components/')[1]?.split('/')[0];
            if (componentName && ['layout', 'ui'].includes(componentName)) {
              return `components-${componentName}`;
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
});
