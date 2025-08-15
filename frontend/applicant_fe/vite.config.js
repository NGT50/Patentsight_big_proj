import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// frontend/applicant_fe/vite.config.js 파일 수정
export default defineConfig({
  plugins: [react()],
  base: '/applicant/',    // ★ 서브 경로 설정 추가
  css: {
    postcss: './postcss.config.js',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://35.175.253.22:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
