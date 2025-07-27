import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 专门用于CloudStudio部署的配置
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    cors: true
  }
})