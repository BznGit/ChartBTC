import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server:{
    proxy: {
      '/chart':'http://localhost:9001',
      '/getchunk':'http://localhost:9001',
      '/update':'http://localhost:9001',
    },
  },
  build: {
    outDir: '../backend/dist'
  }
})
