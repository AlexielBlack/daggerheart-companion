import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'

import './styles/variables.css'
import './styles/base.css'
import './styles/utilities.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Error handler global — filet de sécurité ultime
app.config.errorHandler = (err, instance, info) => {
  console.error('[Global Error Handler]', err, info)
}

app.mount('#app')
