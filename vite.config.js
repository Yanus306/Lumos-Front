import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'public'), 
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    cssCodeSplit: true, 
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        policy: resolve(__dirname, 'src/pages/index.html'),
        content: resolve(__dirname, 'src/content/content.js'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'content' ? 'content/[name].js' : 'assets/[name]-[hash].js';
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
             return 'content/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      },
    },
  },
});