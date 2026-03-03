/**
 * @module core/composables/useInstallPrompt
 * @description Composable pour le prompt d'installation PWA (A2HS).
 *
 * Capture l'evenement `beforeinstallprompt` du navigateur et expose
 * une API reactive pour afficher un bouton d'installation custom.
 *
 * @example
 * import { useInstallPrompt } from '@core/composables/useInstallPrompt'
 * const { canInstall, promptInstall, installOutcome } = useInstallPrompt()
 *
 * // Dans le template :
 * // <button v-if="canInstall" @click="promptInstall">Installer</button>
 */

import { ref, readonly } from 'vue'

/** Evenement differe capture par beforeinstallprompt */
let deferredPrompt = null

/** Etat reactif partage entre tous les consommateurs */
const canInstall = ref(false)
const installOutcome = ref(null) // 'accepted' | 'dismissed' | null
const isInstalled = ref(false)

/**
 * Initialise les ecouteurs d'evenements PWA.
 * Appele une seule fois au demarrage de l'app.
 * Idempotent : les appels multiples sont sans effet.
 */
let initialized = false

export function initInstallPrompt() {
  if (initialized) return
  if (typeof window === 'undefined') return
  initialized = true

  window.addEventListener('beforeinstallprompt', (event) => {
    // Empecher le mini-infobar natif du navigateur
    event.preventDefault()
    deferredPrompt = event
    canInstall.value = true
    installOutcome.value = null
  })

  // Detecter quand l'app est installee
  window.addEventListener('appinstalled', () => {
    isInstalled.value = true
    canInstall.value = false
    deferredPrompt = null
  })

  // Detection heuristique : mode standalone = deja installe
  if (typeof window.matchMedia === 'function') {
    const mq = window.matchMedia('(display-mode: standalone)')
    if (mq.matches) {
      isInstalled.value = true
    }
  }
}

/**
 * Declenche le prompt d'installation natif du navigateur.
 *
 * @returns {Promise<'accepted'|'dismissed'|null>}
 *   Le choix de l'utilisateur, ou null si le prompt n'est pas disponible.
 */
export async function promptInstall() {
  if (!deferredPrompt) return null

  try {
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    installOutcome.value = outcome

    if (outcome === 'accepted') {
      canInstall.value = false
    }

    // Le prompt ne peut etre utilise qu'une fois
    deferredPrompt = null
    return outcome
  } catch (err) {
    console.error('[InstallPrompt] Erreur lors du prompt:', err)
    return null
  }
}

/**
 * Remet l'etat interne a zero (pour les tests).
 * @private
 */
export function _resetInstallPrompt() {
  deferredPrompt = null
  canInstall.value = false
  installOutcome.value = null
  isInstalled.value = false
  initialized = false
}

/**
 * Composable reactif pour les composants Vue.
 *
 * @returns {{
 *   canInstall: Readonly<Ref<boolean>>,
 *   isInstalled: Readonly<Ref<boolean>>,
 *   installOutcome: Readonly<Ref<string|null>>,
 *   promptInstall: () => Promise<string|null>,
 *   initInstallPrompt: () => void
 * }}
 */
export function useInstallPrompt() {
  return {
    canInstall: readonly(canInstall),
    isInstalled: readonly(isInstalled),
    installOutcome: readonly(installOutcome),
    promptInstall,
    initInstallPrompt
  }
}
