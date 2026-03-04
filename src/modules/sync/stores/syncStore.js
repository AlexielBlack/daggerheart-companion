import { defineStore } from 'pinia'
import { useStorage } from '@core/composables/useStorage.js'

/**
 * Store de configuration de la synchronisation.
 * Persiste les préférences et l'historique de sync dans le localStorage.
 */
export const useSyncStore = defineStore('sync', () => {
  // Historique des synchronisations (dernières 20 entrées)
  const { data: history, save: saveHistory } = useStorage('sync-history', [])

  /**
   * Ajoute une entrée à l'historique de synchronisation.
   * @param {{ type: string, method: string, date: string, success: boolean }} entry
   */
  function addHistoryEntry(entry) {
    const entries = Array.isArray(history.value) ? [...history.value] : []
    entries.unshift({
      ...entry,
      id: Date.now()
    })

    // Garder les 20 dernières entrées
    if (entries.length > 20) {
      entries.length = 20
    }

    history.value = entries
    saveHistory(entries)
  }

  /**
   * Vide l'historique de synchronisation.
   */
  function clearHistory() {
    history.value = []
    saveHistory([])
  }

  /**
   * Retourne la dernière synchronisation réussie.
   * @returns {object|null}
   */
  function getLastSuccessfulSync() {
    if (!Array.isArray(history.value)) return null
    return history.value.find((e) => e.success) || null
  }

  return {
    history,
    addHistoryEntry,
    clearHistory,
    getLastSuccessfulSync
  }
})
