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
    // Ensure all HTML files are output to root
    emptyOutDir: true
  },
  // Custom plugin to flatten HTML output
  plugins: [
    {
      name: 'flatten-html',
      enforce: 'post',
      generateBundle(options, bundle) {
        const htmlFiles = Object.keys(bundle).filter(name => name.endsWith('.html'));
        htmlFiles.forEach(name => {
          // Rename nested HTML files to root level
          if (name.includes('/')) {
            const newName = name.split('/').pop();
            bundle[newName] = bundle[name];
            delete bundle[name];
          }
        });
      }
    }
  ]
})
