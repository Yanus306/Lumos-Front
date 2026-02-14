import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src', 
  build: {
    outDir: '../dist',
    enptyOutDir: true, 
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        policy: resolve(__dirname, 'src/pages/index.html'), 
      },
    },
  },

  server: {
    open: true,
  }
});