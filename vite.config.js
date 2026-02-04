import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // 개발 서버 설정
  server: {
    port: 5173,
    open: '/src/popup/popup.html', // npm run dev 하면 바로 팝업창을 띄워줌
  },
  build: {
    rollupOptions: {
      input: {
        // 팝업 페이지 경로를 지정해줍니다.
        popup: resolve(__dirname, 'src/popup/popup.html'),
        // 나중에 팀원들이 줄 content.js나 background.js도 여기에 추가할 예정입니다.
      },
    },
  },
});