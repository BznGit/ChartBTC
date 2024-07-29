import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server:{
    proxy: {
      '/login': 'http://localhost:9000',
      '/registrate': 'http://localhost:9000',
      '/logout': 'http://localhost:9000',
    },
  },
  build: {
    outDir: '../backend/dist'
  }
})
