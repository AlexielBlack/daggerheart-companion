import { ref, watch } from 'vue'

const STORAGE_PREFIX = 'dh-'

/**
 * Composable d'abstraction LocalStorage.
 * Gère la sérialisation JSON, les erreurs de quota, et les données corrompues.
 *
 * @param {string} key - Clé de stockage (préfixée automatiquement)
 * @param {*} defaultValue - Valeur par défaut si la clé n'existe pas
 * @returns {{ data: Ref, save: Function, remove: Function, error: Ref }}
 */
export function useStorage(key, defaultValue = null) {
  const prefixedKey = `${STORAGE_PREFIX}${key}`
  const data = ref(defaultValue)
  const error = ref(null)

  function load() {
    try {
      const raw = localStorage.getItem(prefixedKey)
      if (raw !== null) {
        data.value = JSON.parse(raw)
      }
      error.value = null
    } catch (err) {
      console.error(`[useStorage] Erreur de lecture pour "${prefixedKey}":`, err)
      error.value = `Données corrompues pour "${key}". Valeurs par défaut utilisées.`
      data.value = defaultValue
    }
  }

  function save(value) {
    try {
      const toSave = value !== undefined ? value : data.value
      localStorage.setItem(prefixedKey, JSON.stringify(toSave))
      data.value = toSave
      error.value = null
    } catch (err) {
      console.error(`[useStorage] Erreur d'écriture pour "${prefixedKey}":`, err)
      if (err?.name === 'QuotaExceededError') {
        error.value = 'Espace de stockage insuffisant. Supprimez des données anciennes.'
      } else {
        error.value = `Impossible de sauvegarder "${key}".`
      }
    }
  }

  function remove() {
    try {
      localStorage.removeItem(prefixedKey)
      data.value = defaultValue
      error.value = null
    } catch (err) {
      console.error(`[useStorage] Erreur de suppression pour "${prefixedKey}":`, err)
      error.value = `Impossible de supprimer "${key}".`
    }
  }

  // Chargement initial
  load()

  // Synchronisation automatique : si data change via .value, on sauvegarde
  watch(data, (newVal) => {
    save(newVal)
  }, { deep: true })

  return { data, save, remove, error }
}

/**
 * Exporte toutes les données de l'application (backup).
 * @returns {string} JSON stringifié de toutes les données dh-*
 */
export function exportAllData() {
  const backup = {}
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && key.startsWith(STORAGE_PREFIX)) {
      try {
        backup[key] = JSON.parse(localStorage.getItem(key))
      } catch {
        backup[key] = localStorage.getItem(key)
      }
    }
  }
  return JSON.stringify(backup, null, 2)
}

/**
 * Importe des données de backup dans le LocalStorage.
 * @param {string} jsonString - JSON stringifié à importer
 * @returns {{ success: boolean, error?: string }}
 */
export function importAllData(jsonString) {
  try {
    const data = JSON.parse(jsonString)
    for (const [key, value] of Object.entries(data)) {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.setItem(key, JSON.stringify(value))
      }
    }
    return { success: true }
  } catch (err) {
    console.error('[useStorage] Erreur d\'import:', err)
    return { success: false, error: 'Format de fichier invalide.' }
  }
}
