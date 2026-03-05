/**
 * @module encounter/composables/useSwipe
 * @description Composable pour détecter un swipe horizontal sur une zone tactile.
 *
 * Fonctionnement :
 * - Enregistre la position au touchstart
 * - Évalue au touchend : si déplacement X > seuil ET ratio X/Y > 1.5
 *   (intention horizontale), déclenche onSwipeLeft ou onSwipeRight
 * - Ne perturbe pas le scroll vertical natif (pas de preventDefault)
 *
 * @param {Object} options
 * @param {Function} [options.onSwipeLeft]  - Callback swipe vers la gauche
 * @param {Function} [options.onSwipeRight] - Callback swipe vers la droite
 * @param {number}   [options.threshold=50] - Déplacement X minimum en px
 * @returns {{ onTouchStart, onTouchEnd }} Handlers à lier aux événements touch
 */
export function useSwipe(options = {}) {
  const {
    onSwipeLeft  = () => {},
    onSwipeRight = () => {},
    threshold    = 50
  } = options

  let startX = 0
  let startY = 0

  /**
   * @param {TouchEvent} e
   */
  function onTouchStart(e) {
    const touch = e.changedTouches[0]
    startX = touch.clientX
    startY = touch.clientY
  }

  /**
   * @param {TouchEvent} e
   */
  function onTouchEnd(e) {
    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - startX
    const deltaY = touch.clientY - startY

    const absX = Math.abs(deltaX)
    const absY = Math.abs(deltaY)

    // Seuil atteint ET intention clairement horizontale (pas un scroll vertical)
    if (absX < threshold) return
    if (absX <= absY * 1.5) return

    if (deltaX < 0) {
      onSwipeLeft()
    } else {
      onSwipeRight()
    }
  }

  return { onTouchStart, onTouchEnd }
}
