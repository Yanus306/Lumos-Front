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
        header_style: resolve(__dirname, 'src/policy/header.css'),
        policy_style: resolve(__dirname, 'src/policy/policy.css'),
        policy: resolve(__dirname, 'src/policy/policy.html'),
      },
      output: {
        entryFileNames: `[name]/[name].js`,
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name;

          if (name.endsWith('.css')) {
            // 파일명에 따라 각자 폴더 찾아가기
            if (name.includes('popup')) return 'popup/popup.css';
            if (name.includes('modal')) return 'modal/modal.css';
            if (name.includes('policy') || name.includes('header')) {
              return 'policy/[name][extname]';
            }
          }
          return 'assets/[name][extname]';
        }
      }
    }
  }
});