import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Output directory
    outDir: 'dist',
    
    // Source maps for production debugging
    sourcemap: false,
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    
    // Code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
          'state-vendor': ['zustand'],
          'utils-vendor': ['axios'],
        },
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.css')) {
            return 'assets/css/[name]-[hash].css';
          }
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
    
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    
    // Target modern browsers
    target: 'es2015',
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Build optimization
    reportCompressedSize: true,
    assetsInlineLimit: 4096,
  },
  
  // Resolve aliases for cleaner imports
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@store': resolve(__dirname, './src/store'),
      '@config': resolve(__dirname, './src/config'),
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'axios', 'recharts'],
    exclude: [],
  },
});

