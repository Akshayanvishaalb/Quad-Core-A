import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'src/Dashboard/dashboard.html'),
        profile: resolve(__dirname, 'src/Login and Profile/profile.html'),
        login: resolve(__dirname, 'src/Login and Profile/login.html'),
      }
    }
  }
})
