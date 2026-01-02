import { defineConfig } from 'vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'src/Dashboard/dashboard.html'),
        profile: resolve(__dirname, 'src/LoginProfile/profile.html'),
        login: resolve(__dirname, 'src/LoginProfile/login.html'),
      }
    },
    emptyOutDir: true
  },
  plugins: [
    {
      name: 'rename-html',
      enforce: 'post',
      generateBundle(options, bundle) {
        // Rename dashboard/dashboard.html -> dashboard/index.html
        if (bundle['dashboard/dashboard.html']) {
          bundle['dashboard/index.html'] = bundle['dashboard/dashboard.html'];
          delete bundle['dashboard/dashboard.html'];
        }
        // Rename profile/profile.html -> profile/index.html
        if (bundle['profile/profile.html']) {
          bundle['profile/index.html'] = bundle['profile/profile.html'];
          delete bundle['profile/profile.html'];
        }
        // Rename login/login.html -> login/index.html
        if (bundle['login/login.html']) {
          bundle['login/index.html'] = bundle['login/login.html'];
          delete bundle['login/login.html'];
        }
      }
    }
  ]
})
