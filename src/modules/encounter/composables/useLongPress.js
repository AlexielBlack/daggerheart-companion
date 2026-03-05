/**
 * @module encounter/composables/useLongPress
 * @description Composable pour détecter un clic long (long press).
 * Compatible tactile et souris. Utilisé pour le décrément spotlight
 * en alternative au clic droit (inaccessible sur mobile).
 *
 * @param {Function} callback - Fonction à appeler après le délai
 * @param {Object} [options]
 * @param {number} [options.delay=500] - Délai en ms avant déclenchement
 * @returns {Object} { onPointerDown, onPointerUp, onPointerLeave }
 */
import { ref } from 'vue'

export function useLongPress(callback, options = {}) {
  const delay = options.delay || 500
  const timer = ref(null)
  const fired = ref(false)

  function onPointerDown(e) {
    // Ne réagir qu'au bouton gauche (souris) ou au tactile
    if (e.button && e.button !== 0) return
    fired.value = false
    timer.value = setTimeout(() => {
      fired.value = true
      callback(e)
    }, delay)
  }

  function cancel() {
    if (timer.value) {
      clearTimeout(timer.value)
      timer.value = null
    }
  }

  function onPointerUp() {
    cancel()
  }

  function onPointerLeave() {
    cancel()
  }

  /**
   * Indique si le long press a été déclenché.
   * Permet au composant parent de bloquer le clic normal.
   * @returns {boolean}
   */
  function wasFired() {
    return fired.value
  }

  return {
    onPointerDown,
    onPointerUp,
    onPointerLeave,
    wasFired
  }
}
