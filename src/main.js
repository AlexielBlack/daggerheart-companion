import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import { registerServiceWorker } from '@core/composables/useServiceWorker'
import { initInstallPrompt } from '@core/composables/useInstallPrompt'
import { useNotification } from '@core/composables/useNotification'

import './styles/variables.css'
import './styles/base.css'
import './styles/utilities.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Error handler global
app.config.errorHandler = (err, instance, info) => {
  console.error('[Global Error Handler]', err, info)
}

app.mount('#app')

// PWA — ecouteurs d'installation (avant SW pour capter beforeinstallprompt tot)
initInstallPrompt()

// Service Worker — enregistrement apres montage
if (import.meta.env.PROD) {
  const { info } = useNotification()
  registerServiceWorker({
    onReady() {
      info('Application disponible hors ligne.')
    }
  })
}
