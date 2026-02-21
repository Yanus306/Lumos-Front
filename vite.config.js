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
     
        // [수정] src/detector 안에 있는 파일들을 명시적으로 추가
        overlay: resolve(__dirname, 'src/detector/overlay.js'),
        scanner: resolve(__dirname, 'src/detector/scanner.js'),
        detector_style: resolve(__dirname, 'src/detector/detector.css'),
      },
      output: {
        // JS 파일들이 각자 폴더에 들어가도록 설정
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'overlay' || chunkInfo.name === 'scanner') {
            return 'detector/[name].js';
          }
          return '[name]/[name].js';
        },
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name;

          if (name.endsWith('.css')) {
            if (name.includes('popup')) return 'popup/popup.css';
            if (name.includes('modal')) return 'modal/modal.css';
            // [추가] detector 관련 CSS 경로 설정
            if (name.includes('detector')) return 'detector/detector.css';
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