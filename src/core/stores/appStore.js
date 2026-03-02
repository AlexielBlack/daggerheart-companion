import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAppStore = defineStore('app', () => {
  /** Version de l'application */
  const version = ref('0.1.0')

  /** Indique si l'application a terminé son initialisation */
  const initialized = ref(false)

  /** Module actuellement actif (pour le breadcrumb, etc.) */
  const activeModule = ref(null)

  function setActiveModule(moduleName) {
    activeModule.value = moduleName
  }

  function markInitialized() {
    initialized.value = true
  }

  return {
    version,
    initialized,
    activeModule,
    setActiveModule,
    markInitialized
  }
})
