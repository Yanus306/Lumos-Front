import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist'), 
    emptyOutDir: true,
    minify: false,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        modal: resolve(__dirname, 'src/modal/modal.js'),
        modal_style: resolve(__dirname, 'src/modal/modal.css'),
      },
      output: {
        entryFileNames: `[name]/[name].js`,
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            if (assetInfo.name.includes('popup')) return 'popup/popup.css';
            return 'modal/modal.css';
          }
          return 'assets/[name][extname]';
        }
      }
    }
  }
});