import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'src/Dashboard/dashboard.html'),
        profile: resolve(__dirname, 'src/LoginProfile/profile.html'),
        login: resolve(__dirname, 'src/LoginProfile/login.html'),
      }
    }
  }
})
