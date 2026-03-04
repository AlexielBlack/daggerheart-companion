import { ref } from 'vue'
import { exportAllData, importAllData } from '@core/composables/useStorage.js'

/**
 * Composable pour la synchronisation par fichier JSON.
 * Encapsule l'export (téléchargement) et l'import (chargement) de données.
 */
export function useFileSync() {
  const status = ref('idle') // 'idle' | 'exporting' | 'importing' | 'success' | 'error'
  const error = ref(null)
  const lastAction = ref(null) // { type: 'export' | 'import', date: string }

  /**
   * Génère un nom de fichier horodaté.
   * @returns {string}
   */
  function generateFilename() {
    const now = new Date()
    const date = now.toISOString().slice(0, 10).replace(/-/g, '')
    const time = now.toTimeString().slice(0, 5).replace(':', '')
    return `daggerheart-backup-${date}-${time}.json`
  }

  /**
   * Exporte toutes les données vers un fichier JSON téléchargeable.
   */
  function exportToFile() {
    try {
      status.value = 'exporting'
      error.value = null

      const jsonData = exportAllData()
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = url
      link.download = generateFilename()
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()

      // Nettoyage
      setTimeout(() => {
        URL.revokeObjectURL(url)
        document.body.removeChild(link)
      }, 100)

      lastAction.value = { type: 'export', date: new Date().toISOString() }
      status.value = 'success'
    } catch (err) {
      console.error('[useFileSync] Erreur export:', err)
      error.value = 'Impossible d\'exporter les données.'
      status.value = 'error'
    }
  }

  /**
   * Importe des données depuis un fichier JSON.
   * @param {File} file - Fichier JSON sélectionné par l'utilisateur
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async function importFromFile(file) {
    if (!file) {
      error.value = 'Aucun fichier sélectionné.'
      status.value = 'error'
      return { success: false, error: error.value }
    }

    if (!file.name.endsWith('.json')) {
      error.value = 'Le fichier doit être au format .json.'
      status.value = 'error'
      return { success: false, error: error.value }
    }

    try {
      status.value = 'importing'
      error.value = null

      const text = await readFileAsText(file)
      const result = importAllData(text)

      if (result.success) {
        lastAction.value = { type: 'import', date: new Date().toISOString() }
        status.value = 'success'
        return { success: true }
      } else {
        error.value = result.error || 'Format de fichier invalide.'
        status.value = 'error'
        return { success: false, error: error.value }
      }
    } catch (err) {
      console.error('[useFileSync] Erreur import:', err)
      error.value = 'Impossible de lire le fichier.'
      status.value = 'error'
      return { success: false, error: error.value }
    }
  }

  /**
   * Lit un fichier en tant que texte via FileReader (Promise).
   * @param {File} file
   * @returns {Promise<string>}
   */
  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
      reader.readAsText(file)
    })
  }

  /**
   * Réinitialise le statut.
   */
  function resetStatus() {
    status.value = 'idle'
    error.value = null
  }

  return {
    status,
    error,
    lastAction,
    exportToFile,
    importFromFile,
    resetStatus,
    generateFilename
  }
}
