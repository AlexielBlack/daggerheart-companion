/**
 * @module core/composables/useServiceWorker
 * @description Composable pour l'enregistrement et la gestion du Service Worker.
 *
 * Responsabilites :
 *   - Enregistrement du SW au montage de l'app
 *   - Detection des mises a jour disponibles
 *   - Notification utilisateur via useNotification
 *   - Application de la mise a jour (skipWaiting + reload)
 *
 * @example
 * import { useServiceWorker } from '@core/composables/useServiceWorker'
 * const { isReady, hasUpdate, applyUpdate } = useServiceWorker()
 */

import { ref, readonly } from 'vue'

/** Etat reactif partage */
const isSupported = ref('serviceWorker' in navigator)
const isReady = ref(false)
const hasUpdate = ref(false)
const isOffline = ref(!navigator.onLine)

/** Reference au SW en attente (waiting) */
let waitingWorker = null

/** Reference a la registration */
let registration = null

/**
 * Enregistre le service worker et configure les ecouteurs.
 * Appele une seule fois au demarrage de l'app.
 *
 * @param {Object} options
 * @param {Function} [options.onUpdate] - Callback quand une mise a jour est detectee
 * @param {Function} [options.onReady] - Callback quand le SW est actif
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerServiceWorker({ onUpdate, onReady } = {}) {
  if (!isSupported.value) return null

  try {
    registration = await navigator.serviceWorker.register(
      '/daggerheart-companion/sw.js',
      { scope: '/daggerheart-companion/' }
    )

    // SW deja actif
    if (registration.active) {
      isReady.value = true
      if (onReady) onReady()
    }

    // Detecter un SW en attente (mise a jour pre-installee)
    if (registration.waiting) {
      waitingWorker = registration.waiting
      hasUpdate.value = true
      if (onUpdate) onUpdate()
    }

    // Ecouter les nouvelles installations
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        // Le nouveau SW est installe et en attente
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          waitingWorker = newWorker
          hasUpdate.value = true
          if (onUpdate) onUpdate()
        }

        // Le nouveau SW est active (premiere installation)
        if (newWorker.state === 'activated') {
          isReady.value = true
          if (onReady) onReady()
        }
      })
    })

    // Quand un nouveau SW prend le controle → recharger
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })

    return registration
  } catch (err) {
    console.error('[SW] Registration failed:', err)
    return null
  }
}

/**
 * Applique la mise a jour en demandant au SW en attente
 * de prendre le relais (skipWaiting).
 * Declenche un reload via l'ecouteur controllerchange.
 */
export function applyUpdate() {
  if (!waitingWorker) return false
  waitingWorker.postMessage('SKIP_WAITING')
  return true
}

/**
 * Verifie manuellement si une mise a jour est disponible.
 * @returns {Promise<boolean>}
 */
export async function checkForUpdate() {
  if (!registration) return false
  try {
    await registration.update()
    return hasUpdate.value
  } catch {
    return false
  }
}

/**
 * Vide tous les caches du service worker, le desenregistre, puis recharge.
 * Utile sur iPad/Safari ou le cache PWA peut rester bloque.
 * @returns {Promise<boolean>}
 */
export async function clearCacheAndReload() {
  try {
    // Methode 1 : demander au SW de tout vider
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage('CLEAR_CACHE')
    }

    // Methode 2 : vider les caches cote client (fallback)
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }

    // Desenregistrer tous les service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((r) => r.unregister()))
    }

    // Recharger sans cache
    window.location.reload()
    return true
  } catch (err) {
    console.error('[SW] Clear cache failed:', err)
    return false
  }
}

/**
 * Composable reactif pour les composants Vue.
 *
 * @returns {{
 *   isSupported: Readonly<Ref<boolean>>,
 *   isReady: Readonly<Ref<boolean>>,
 *   hasUpdate: Readonly<Ref<boolean>>,
 *   isOffline: Readonly<Ref<boolean>>,
 *   applyUpdate: Function,
 *   checkForUpdate: Function,
 *   clearCacheAndReload: Function
 * }}
 */
export function useServiceWorker() {
  return {
    isSupported: readonly(isSupported),
    isReady: readonly(isReady),
    hasUpdate: readonly(hasUpdate),
    isOffline: readonly(isOffline),
    applyUpdate,
    checkForUpdate,
    clearCacheAndReload
  }
}

// ── Ecouteurs offline/online ──

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { isOffline.value = false })
  window.addEventListener('offline', () => { isOffline.value = true })
}
