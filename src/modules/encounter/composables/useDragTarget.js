/**
 * @module encounter/composables/useDragTarget
 * @description Gestion du drag-and-drop entre PJs et adversaires.
 * Le drag commence sur une carte (PJ ou adversaire) et se termine
 * sur une carte du camp oppose. Au relachement, un popup d'action apparait.
 *
 * Etat global (singleton) — partage entre tous les composants du combat.
 */

import { ref, readonly } from 'vue'

// ── Etat singleton ──

/** Source du drag en cours */
const dragSource = ref(null) // { id, type: 'pc' | 'adversary', name }

/** Cible survolee */
const dragOver = ref(null) // { id, type: 'pc' | 'adversary', name }

/** Position d'origine du drag (centre de la carte source) */
const dragOrigin = ref({ x: 0, y: 0 })

/** Position courante du pointeur */
const dragPos = ref({ x: 0, y: 0 })

/** Indique si un drag est en cours */
const isDragging = ref(false)

/** Resultat du drop (source + target), declenche le popup */
const dropResult = ref(null) // { source, target, x, y }

/**
 * Composable pour le systeme de drag-and-drop combat.
 * @returns {Object} API drag
 */
export function useDragTarget() {

  /**
   * Demarre un drag depuis une carte.
   * @param {{ id: string, type: 'pc'|'adversary', name: string }} source
   * @param {PointerEvent} e
   */
  /**
   * Bloque le scroll natif iPadOS pendant le drag.
   * Ne bloque que si un drag est actif (vérifié dans le handler).
   */
  function preventTouchMove(e) {
    if (isDragging.value) e.preventDefault()
  }

  // Listener permanent mais conditionnel — pas de risque de fuite
  if (typeof document !== 'undefined') {
    document.addEventListener('touchmove', preventTouchMove, { passive: false })
  }

  function startDrag(source, e) {
    dragSource.value = source
    dragPos.value = { x: e.clientX, y: e.clientY }
    // Origine = centre de la carte source (via data-drag-id)
    const card = e.target?.closest?.('[data-drag-id]')
    if (card) {
      const rect = card.getBoundingClientRect()
      dragOrigin.value = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    } else {
      dragOrigin.value = { x: e.clientX, y: e.clientY }
    }
    isDragging.value = true
    dropResult.value = null
    dragOver.value = null
  }

  /**
   * Met a jour la position du pointeur pendant le drag.
   * @param {PointerEvent} e
   */
  function moveDrag(e) {
    if (!isDragging.value) return
    dragPos.value = { x: e.clientX, y: e.clientY }
  }

  /**
   * Signale qu'une cible est survolee.
   * @param {{ id: string, type: 'pc'|'adversary', name: string }|null} target
   */
  function setDragOver(target) {
    dragOver.value = target
  }

  /**
   * Termine le drag. Si une cible valide est survolee (camp oppose),
   * enregistre le dropResult pour afficher le popup.
   */
  function endDrag() {
    if (isDragging.value && dragSource.value && dragOver.value) {
      // Accepter tout ciblage sauf soi-même
      const sameEntity = dragSource.value.id === dragOver.value.id && dragSource.value.type === dragOver.value.type
      if (!sameEntity) {
        dropResult.value = {
          source: { ...dragSource.value },
          target: { ...dragOver.value },
          x: dragPos.value.x,
          y: dragPos.value.y
        }
      }
    }
    isDragging.value = false
    dragSource.value = null
    dragOver.value = null
  }

  function cancelDrag() {
    isDragging.value = false
    dragSource.value = null
    dragOver.value = null
    dragPos.value = { x: 0, y: 0 }
  }

  /**
   * Ferme le popup d'action (apres application ou annulation).
   */
  function clearDropResult() {
    dropResult.value = null
  }

  return {
    dragSource: readonly(dragSource),
    dragOver: readonly(dragOver),
    dragOrigin: readonly(dragOrigin),
    dragPos: readonly(dragPos),
    isDragging: readonly(isDragging),
    dropResult,
    startDrag,
    moveDrag,
    setDragOver,
    endDrag,
    cancelDrag,
    clearDropResult
  }
}
