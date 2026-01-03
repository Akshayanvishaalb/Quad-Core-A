import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/',
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),

        login: resolve(__dirname, 'src/LoginProfile/login.html'),
        profile: resolve(__dirname, 'src/LoginProfile/profile.html'),

        dashboard: resolve(__dirname, 'src/Dashboard/dashboard.html'),
        reports: resolve(__dirname, 'src/Reports/reports.html'),
        prescriptions: resolve(__dirname, 'src/Prescriptions/index.html'),

        privacy: resolve(__dirname, 'src/PrivacySupport/Privacy.html'),
        support: resolve(__dirname, 'src/PrivacySupport/Support.html'),

        medicalHistory: resolve(__dirname, 'src/MedicalHistory/MedicalHistory.html'),

        settings: resolve(__dirname, 'src/Settings/settings.html')
      }
    },
    emptyOutDir: true
  },
  plugins: [
    {
      name: 'rename-html',
      enforce: 'post',
      // generateBundle(_, bundle) {
      //   const rename = (from, to) => {
      //     if (bundle[from]) {
      //       bundle[to] = bundle[from]
      //       delete bundle[from]
      //     }
      //   }
      //
      //   rename('dashboard/dashboard.html', 'dashboard/index.html')
      //   rename('profile/profile.html', 'profile/index.html')
      //   rename('login/login.html', 'login/index.html')
      //   rename('reports/reports.html', 'reports/index.html')
      //   rename('prescriptions/index.html', 'prescriptions/index.html')
      //   rename('privacy/Privacy.html', 'privacy/index.html')
      //   rename('support/Support.html', 'support/index.html')
      //   rename('medicalHistory/MedicalHistory.html', 'medical-history/index.html')
      // }

      generateBundle(_, bundle) {
        const rename = (from, to) => {
          if (bundle[from]) {
            // Update script tags in the HTML to match new path
            if (to.includes('dashboard')) {
              bundle[from].source = bundle[from].source.replace(
                  /<script type="module" crossorigin src="\/assets\/dashboard-[^"]+\.js"><\/script>/,
                  '<script type="module" src="../../assets/dashboard.js"></script>'
              );
            }
            bundle[to] = bundle[from];
            delete bundle[from];
          }
        }

        rename('dashboard/dashboard.html', 'dashboard/index.html')
        rename('profile/profile.html', 'profile/index.html')
        rename('login/login.html', 'login/index.html')
        rename('reports/reports.html', 'reports/index.html')
        rename('prescriptions/index.html', 'prescriptions/index.html')
        rename('privacy/Privacy.html', 'privacy/index.html')
        rename('support/Support.html', 'support/index.html')
        rename('medicalHistory/MedicalHistory.html', 'medical-history/index.html')
        rename('settings/settings.html', 'settings/index.html')
      }

    }
  ]
})
