import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          // Add custom Babel plugins here if needed
        ],
      },
    }),
    imagemin({
      gifsicle: { optimizationLevel: 3 },
      mozjpeg: { quality: 75 },
      pngquant: { quality: [0.8, 0.9] },
      svgo: {
        plugins: [{ 
          name: 'removeViewBox', 
          active: false 
        }]
      }
    })
  ],
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },

  build: {
    outDir: 'dist/client',
    minify: 'esbuild',
    sourcemap: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          // Add other vendor chunks as needed
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js'
      },
    },
  },

  server: {
    port: 5173,
    host: true,
    open: false,
    strictPort: false,
    hmr: {
      host: 'localhost',
      port: 5173,
    },
  },

  preview: {
    port: 5174,
    host: true,
    strictPort: true,
  },

  cacheDir: './node_modules/.vite',
});