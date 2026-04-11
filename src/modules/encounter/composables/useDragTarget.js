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
  function startDrag(source, e) {
    dragSource.value = source
    dragPos.value = { x: e.clientX, y: e.clientY }
    isDragging.value = true
    dropResult.value = null
    dragOver.value = null
    // Bloquer tout scroll pendant le drag
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
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
  function unfreezeScroll() {
    document.body.style.overflow = ''
    document.body.style.touchAction = ''
  }

  function endDrag() {
    if (isDragging.value && dragSource.value && dragOver.value) {
      if (dragSource.value.type !== dragOver.value.type) {
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
    unfreezeScroll()
  }

  function cancelDrag() {
    isDragging.value = false
    dragSource.value = null
    dragOver.value = null
    dragPos.value = { x: 0, y: 0 }
    unfreezeScroll()
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
