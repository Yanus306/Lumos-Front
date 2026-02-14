import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    // CSS 코드 분할을 활성화하여 팝업과 컨텐츠 CSS가 섞이지 않게 합니다.
    cssCodeSplit: true, 
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        policy: resolve(__dirname, 'src/pages/index.html'),
        content: resolve(__dirname, 'src/content/content.js'),
      },
      output: {
        entryFileNames: `[name]/[name].js`,
        assetFileNames: (assetInfo) => {
          // content script용 CSS만 고정된 경로로 출력
          if (assetInfo.name === 'content.css') {
            return 'content/style.css';
          }
          // 나머지는 기본 assets 폴더로 보내 팝업 디자인을 보호합니다.
          return 'assets/[name]-[hash][extname]';
        }
      }
    },
  },
});