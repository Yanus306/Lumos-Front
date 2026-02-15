import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  // publicDir을 상대 경로로 정확히 지정 (src 기준 상위의 public)
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
          // CSS 파일만 content 폴더로 보냅니다.
          if (assetInfo.name.endsWith('.css')) return 'content/style.css';
          // 그 외 빌드 중 생성되는 자산은 원래 이름을 유지합니다.
          return 'assets/[name][extname]';
        },
      },
    },
  },
});