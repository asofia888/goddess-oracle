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
            manualChunks: {
              // Separate vendor chunk for larger libraries
              'google-genai': ['@google/genai'],
              // Group modals together since they're lazy loaded
              'modals': [
                './components/MessageModal',
                './components/JournalModal',
                './components/DisclaimerModal',
                './components/ManualModal'
              ],
              // Utils and constants
              'utils': [
                './utils/storage',
                './utils/i18n',
                './constants'
              ]
            }
          }
        },
        chunkSizeWarningLimit: 300,
        target: 'esnext',
        minify: 'esbuild'
      }
    };
});
