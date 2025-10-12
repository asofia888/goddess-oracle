import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: (id) => {
              // Separate vendor chunks
              if (id.includes('node_modules')) {
                if (id.includes('@google/genai')) {
                  return 'vendor-google-genai';
                }
                if (id.includes('react') || id.includes('react-dom')) {
                  return 'vendor-react';
                }
                return 'vendor-other';
              }

              // Separate card data by language for better caching
              if (id.includes('constants/ja.ts')) {
                return 'cards-ja';
              }
              if (id.includes('constants/en.ts')) {
                return 'cards-en';
              }

              // Group modal components
              if (id.includes('components/MessageModal') ||
                  id.includes('components/JournalModal') ||
                  id.includes('components/DisclaimerModal') ||
                  id.includes('components/ManualModal')) {
                return 'modals';
              }

              // Group utility functions
              if (id.includes('utils/')) {
                return 'utils';
              }
            },
            // Optimize chunk file names
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          }
        },
        chunkSizeWarningLimit: 500,
        target: 'esnext',
        minify: 'esbuild',
        // Enable CSS code splitting
        cssCodeSplit: true,
        // Optimize asset inlining
        assetsInlineLimit: 4096,
        // Enable source maps for production debugging (optional)
        sourcemap: false
      }
    };
});
