/**
 * @module encounter/composables/useHaptic
 * @description Composable pour le retour haptique tactile.
 *
 * Fournit des patterns vibratoires pré-définis pour les actions courantes
 * du mode live encounter. No-op silencieux sur les navigateurs
 * ou appareils qui ne supportent pas l'API Vibration.
 *
 * @example
 * import { useHaptic } from '../composables/useHaptic'
 * const haptic = useHaptic()
 * haptic.tap()       // micro-pulse sur tap seuil
 * haptic.defeat()    // pattern distinctif pour vaincre
 * haptic.swap()      // confirmation swap spotlight
 */

/**
 * Patterns vibratoires (en ms).
 * - Valeur unique = durée d'une vibration
 * - Tableau = alternance vibration / pause / vibration…
 */
const HAPTIC_PATTERNS = {
  /** Micro-pulse pour les taps fréquents (boutons seuils 1/2/3, +/- stress) */
  tap: 10,
  /** Confirmation de basculement (swap spotlight, toggle condition) */
  swap: 15,
  /** Confirmation d'annulation (undo) */
  undo: 5,
  /** Pattern distinctif pour vaincre un adversaire */
  defeat: [20, 50, 20],
  /** Confirmation d'action lourde (appliquer AoE, fin de rencontre) */
  confirm: [15, 30, 15],
  /** Avertissement / erreur */
  warning: [30, 20, 30, 20, 30]
}

/**
 * Vérifie si l'API Vibration est disponible.
 * @returns {boolean}
 */
function isSupported() {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

/**
 * Déclenche une vibration avec le pattern donné.
 * No-op si l'API n'est pas supportée.
 * @param {number|number[]} pattern - Durée(s) en ms
 */
function vibrate(pattern) {
  if (isSupported()) {
    navigator.vibrate(pattern)
  }
}

/**
 * Crée une instance du composable haptique.
 * Chaque méthode correspond à un pattern nommé.
 *
 * @returns {Object} Méthodes haptiques + utilitaires
 */
export function useHaptic() {
  return {
    /** Micro-pulse pour taps fréquents (seuils, stress) */
    tap()     { vibrate(HAPTIC_PATTERNS.tap) },
    /** Confirmation swap spotlight */
    swap()    { vibrate(HAPTIC_PATTERNS.swap) },
    /** Confirmation undo */
    undo()    { vibrate(HAPTIC_PATTERNS.undo) },
    /** Pattern distinctif pour vaincre */
    defeat()  { vibrate(HAPTIC_PATTERNS.defeat) },
    /** Confirmation action lourde (AoE, fin) */
    confirm() { vibrate(HAPTIC_PATTERNS.confirm) },
    /** Avertissement / erreur */
    warning() { vibrate(HAPTIC_PATTERNS.warning) },
    /** Vibration avec un pattern personnalisé */
    custom(pattern) { vibrate(pattern) },
    /** Indique si le feedback haptique est supporté */
    isSupported
  }
}

// Exporter les patterns pour les tests
export { HAPTIC_PATTERNS }
