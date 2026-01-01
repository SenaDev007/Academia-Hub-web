import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Configuration Vite pour Web SaaS uniquement
// Aucune référence Electron
export default defineConfig({
  plugins: [react()],
  
  base: './',
  
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    rollupOptions: {
      input: {
        main: resolve(process.cwd(), 'index.html'),
      },
      output: {
        // Optimized chunk splitting strategy
        manualChunks: {
          // Core React and framework chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // UI and styling chunks
          'ui-vendor': ['@headlessui/react', '@heroicons/react', 'lucide-react'],
          
          // Chart and visualization chunks
          'charts-vendor': ['recharts'],
          
          // PDF and document processing chunks
          'pdf-vendor': ['jspdf', 'jspdf-autotable', '@react-pdf/renderer'],
          
          // Utility and helper chunks
          'utils-vendor': ['date-fns', 'uuid', 'axios', 'zustand'],
          
          // File processing chunks
          'file-vendor': ['xlsx', 'react-dropzone'],
        },
        
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg)$/.test(assetInfo.name)) {
            return `images/[name]-[hash].${ext}`;
          }
          if (/\.(css)$/.test(assetInfo.name)) {
            return `css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 1000,
  },
  
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  
  server: {
    port: 5173,
    host: true,
    strictPort: true,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  
  resolve: {
    alias: {
      '@': resolve(process.cwd(), './src'),
    },
  },
  
  define: {
    'process.env': process.env,
    'global': 'globalThis',
  },
});

