import { ref, computed } from 'vue'
import { exportAllData, importAllData } from '@core/composables/useStorage.js'

const GIST_API = 'https://api.github.com/gists'
const GIST_FILENAME = 'daggerheart-companion-sync.json'
const STORAGE_PREFIX = 'dh-'

/** Options fetch communes — désactive le cache Safari */
const FETCH_OPTS = { cache: 'no-store' }

/**
 * Composable pour la synchronisation via GitHub Gist.
 * Permet de pousser/tirer les données de l'application vers un Gist privé.
 */
export function useGistSync() {
  const status = ref('idle') // 'idle' | 'pushing' | 'pulling' | 'success' | 'error'
  const error = ref(null)
  const lastSync = ref(null) // { type: 'push' | 'pull', date: string }
  const remoteInfo = ref(null) // { updatedAt: string, description: string }

  /**
   * Récupère le token GitHub depuis le localStorage.
   * @returns {string|null}
   */
  function getToken() {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}gist-token`)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  /**
   * Sauvegarde le token GitHub dans le localStorage.
   * @param {string} token
   */
  function setToken(token) {
    localStorage.setItem(`${STORAGE_PREFIX}gist-token`, JSON.stringify(token))
  }

  /**
   * Supprime le token GitHub du localStorage.
   */
  function clearToken() {
    localStorage.removeItem(`${STORAGE_PREFIX}gist-token`)
  }

  /**
   * Récupère l'ID du Gist depuis le localStorage.
   * @returns {string|null}
   */
  function getGistId() {
    try {
      const raw = localStorage.getItem(`${STORAGE_PREFIX}gist-id`)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  /**
   * Sauvegarde l'ID du Gist dans le localStorage.
   * @param {string} id
   */
  function setGistId(id) {
    localStorage.setItem(`${STORAGE_PREFIX}gist-id`, JSON.stringify(id))
  }

  /**
   * Indique si la configuration Gist est prête (token + gist ID).
   */
  const isConfigured = computed(() => {
    return !!(getToken() && getGistId())
  })

  /**
   * Teste la validité du token GitHub.
   * @param {string} token
   * @returns {Promise<{ valid: boolean, username?: string, error?: string }>}
   */
  async function validateToken(token) {
    try {
      const response = await fetch('https://api.github.com/user', {
        ...FETCH_OPTS,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        return { valid: true, username: data.login }
      }

      const errBody = await response.json().catch(() => ({}))
      const detail = errBody.message || ''
      console.error('[useGistSync] validateToken:', response.status, detail)

      if (response.status === 401) {
        return { valid: false, error: `Token invalide ou expiré (${detail || '401'}).` }
      }

      return { valid: false, error: `Erreur GitHub (${response.status}): ${detail}` }
    } catch {
      return { valid: false, error: 'Impossible de contacter GitHub. Vérifiez votre connexion.' }
    }
  }

  /**
   * Recherche un Gist existant contenant le fichier de synchronisation.
   * Permet la découverte automatique sur un nouvel appareil.
   * @param {string} token
   * @returns {Promise<{ found: boolean, gistId?: string, error?: string }>}
   */
  async function findExistingGist(token) {
    try {
      const response = await fetch(`${GIST_API}?per_page=100`, {
        ...FETCH_OPTS,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        return { found: false, error: `Erreur recherche Gist (${response.status}).` }
      }

      const gists = await response.json()
      const match = gists.find((g) => g.files && g.files[GIST_FILENAME])

      if (match) {
        return { found: true, gistId: match.id }
      }

      return { found: false }
    } catch {
      return { found: false, error: 'Impossible de rechercher les Gists existants.' }
    }
  }

  /**
   * Crée un nouveau Gist privé pour la synchronisation.
   * @returns {Promise<{ success: boolean, gistId?: string, error?: string }>}
   */
  async function createGist() {
    const token = getToken()
    if (!token) {
      return { success: false, error: 'Token non configuré.' }
    }

    try {
      const payload = buildGistPayload()

      const response = await fetch(GIST_API, {
        ...FETCH_OPTS,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: 'Daggerheart Companion — Données synchronisées',
          public: false,
          files: {
            [GIST_FILENAME]: { content: JSON.stringify(payload) }
          }
        })
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        return { success: false, error: `Erreur création Gist (${response.status}): ${errData.message || ''}` }
      }

      const data = await response.json()
      setGistId(data.id)
      return { success: true, gistId: data.id }
    } catch {
      return { success: false, error: 'Impossible de créer le Gist.' }
    }
  }

  /**
   * Pousse (push) les données locales vers le Gist distant.
   * Crée automatiquement le Gist s'il n'existe pas encore.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async function push() {
    const token = getToken()
    if (!token) {
      error.value = 'Token non configuré.'
      status.value = 'error'
      return { success: false, error: error.value }
    }

    let gistId = getGistId()

    try {
      status.value = 'pushing'
      error.value = null

      // Création automatique si pas de Gist
      if (!gistId) {
        const createResult = await createGist()
        if (!createResult.success) {
          error.value = createResult.error
          status.value = 'error'
          return { success: false, error: error.value }
        }
        gistId = createResult.gistId
        lastSync.value = { type: 'push', date: new Date().toISOString() }
        status.value = 'success'
        return { success: true }
      }

      // Mise à jour du Gist existant
      const payload = buildGistPayload()

      const response = await fetch(`${GIST_API}/${gistId}`, {
        ...FETCH_OPTS,
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          files: {
            [GIST_FILENAME]: { content: JSON.stringify(payload) }
          }
        })
      })

      if (response.status === 404) {
        // Le Gist n'existe plus, on en crée un nouveau
        setGistId(null)
        const createResult = await createGist()
        if (!createResult.success) {
          error.value = createResult.error
          status.value = 'error'
          return { success: false, error: error.value }
        }
        lastSync.value = { type: 'push', date: new Date().toISOString() }
        status.value = 'success'
        return { success: true }
      }

      if (!response.ok) {
        error.value = `Erreur push (${response.status}).`
        status.value = 'error'
        return { success: false, error: error.value }
      }

      lastSync.value = { type: 'push', date: new Date().toISOString() }
      status.value = 'success'
      return { success: true }
    } catch (err) {
      console.error('[useGistSync] Erreur push:', err)
      error.value = 'Impossible de pousser les données vers GitHub.'
      status.value = 'error'
      return { success: false, error: error.value }
    }
  }

  /**
   * Tire (pull) les données distantes depuis le Gist.
   * @returns {Promise<{ success: boolean, error?: string }>}
   */
  async function pull() {
    const token = getToken()
    const gistId = getGistId()

    if (!token || !gistId) {
      error.value = 'Configuration incomplète (token ou Gist ID manquant).'
      status.value = 'error'
      return { success: false, error: error.value }
    }

    try {
      status.value = 'pulling'
      error.value = null

      const response = await fetch(`${GIST_API}/${gistId}`, {
        ...FETCH_OPTS,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })

      if (response.status === 404) {
        error.value = 'Gist introuvable. Il a peut-être été supprimé.'
        status.value = 'error'
        return { success: false, error: error.value }
      }

      if (!response.ok) {
        error.value = `Erreur pull (${response.status}).`
        status.value = 'error'
        return { success: false, error: error.value }
      }

      const data = await response.json()
      const file = data.files?.[GIST_FILENAME]

      if (!file || !file.content) {
        error.value = 'Le Gist ne contient pas de données valides.'
        status.value = 'error'
        return { success: false, error: error.value }
      }

      const payload = JSON.parse(file.content)

      // Vérification du format
      if (!payload.version || !payload.data) {
        error.value = 'Format de données distant invalide.'
        status.value = 'error'
        return { success: false, error: error.value }
      }

      // Import des données
      const importResult = importAllData(JSON.stringify(payload.data))
      if (!importResult.success) {
        error.value = importResult.error || 'Erreur d\'import des données.'
        status.value = 'error'
        return { success: false, error: error.value }
      }

      remoteInfo.value = {
        updatedAt: data.updated_at,
        description: data.description
      }
      lastSync.value = { type: 'pull', date: new Date().toISOString() }
      status.value = 'success'
      return { success: true }
    } catch (err) {
      console.error('[useGistSync] Erreur pull:', err)
      error.value = 'Impossible de récupérer les données depuis GitHub.'
      status.value = 'error'
      return { success: false, error: error.value }
    }
  }

  /**
   * Récupère les métadonnées du Gist distant (date de mise à jour, etc.).
   * @returns {Promise<{ success: boolean, info?: object, error?: string }>}
   */
  async function fetchRemoteInfo() {
    const token = getToken()
    const gistId = getGistId()

    if (!token || !gistId) {
      return { success: false, error: 'Configuration incomplète.' }
    }

    try {
      const response = await fetch(`${GIST_API}/${gistId}`, {
        ...FETCH_OPTS,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        return { success: false, error: `Erreur (${response.status}).` }
      }

      const data = await response.json()
      const file = data.files?.[GIST_FILENAME]
      let syncDate = null

      if (file?.content) {
        try {
          const payload = JSON.parse(file.content)
          syncDate = payload.syncDate || null
        } catch {
          // Format invalide, on continue sans la date
        }
      }

      const info = {
        updatedAt: data.updated_at,
        description: data.description,
        syncDate,
        url: data.html_url
      }

      remoteInfo.value = info
      return { success: true, info }
    } catch {
      return { success: false, error: 'Impossible de contacter GitHub.' }
    }
  }

  /**
   * Construit le payload de synchronisation avec métadonnées.
   * @returns {object}
   */
  function buildGistPayload() {
    const rawData = exportAllData()
    return {
      version: 1,
      appName: 'daggerheart-companion',
      syncDate: new Date().toISOString(),
      data: JSON.parse(rawData)
    }
  }

  /**
   * Déconnecte la synchronisation Gist (supprime token + gist ID).
   */
  function disconnect() {
    clearToken()
    localStorage.removeItem(`${STORAGE_PREFIX}gist-id`)
    remoteInfo.value = null
    lastSync.value = null
    status.value = 'idle'
    error.value = null
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
    lastSync,
    remoteInfo,
    isConfigured,
    getToken,
    setToken,
    clearToken,
    getGistId,
    setGistId,
    validateToken,
    findExistingGist,
    createGist,
    push,
    pull,
    fetchRemoteInfo,
    disconnect,
    resetStatus
  }
}
