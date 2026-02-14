import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        content: resolve(__dirname, 'src/content/content.js'),
      },
      output: {
        entryFileNames: `[name]/[name].js`,
        assetFileNames: (assetInfo) => {

          if (assetInfo.name.endsWith('.css')) return 'content/style.css';
          return 'assets/[name]-[hash][extname]';
        }
      },
    },
  },
});