/**
 * @module encounter/composables/useUndoStack
 * @description Pile d'annulation (Ctrl+Z) pour le mode live.
 * Snapshote l'état combat avant chaque action mutante.
 *
 * @param {Object} deps - Refs et fonctions injectées depuis le store
 * @param {import('vue').Ref<boolean>} deps.isActive
 * @param {import('vue').Ref<Array>} deps.liveAdversaries
 * @param {import('vue').Ref<Array>} deps.combatLog
 * @param {import('vue').Ref<Array>} deps.encounterLog
 * @param {import('vue').Ref<Object>} deps.pcDownStatus
 * @param {import('vue').Ref<Object>} deps.pcConditions
 * @param {import('vue').Ref<string|null>} deps.activeAdversaryId
 * @param {Function} deps.persistState
 */

import { ref } from 'vue'

/** Taille maximale de la pile */
const UNDO_MAX = 50

export function useUndoStack(deps) {
  const {
    isActive,
    liveAdversaries,
    combatLog,
    encounterLog,
    pcDownStatus,
    pcConditions,
    activeAdversaryId,
    persistState
  } = deps

  /** Snapshots d'état avant chaque action mutante */
  const undoStack = ref([])

  /**
   * Sauvegarde un snapshot de l'état actuel dans la pile d'undo.
   * Appelé avant chaque action qui modifie les données de combat.
   * @param {string} [label=''] - Description courte de l'action (ex: '+2 HP Goblin')
   */
  function pushUndo(label = '') {
    if (!isActive.value) return
    const snapshot = {
      label,
      liveAdversaries: JSON.parse(JSON.stringify(liveAdversaries.value)),
      combatLog: JSON.parse(JSON.stringify(combatLog.value)),
      encounterLog: JSON.parse(JSON.stringify(encounterLog.value)),
      pcDownStatus: { ...pcDownStatus.value },
      pcConditions: JSON.parse(JSON.stringify(pcConditions.value)),
      activeAdversaryId: activeAdversaryId.value
    }
    undoStack.value.push(snapshot)
    if (undoStack.value.length > UNDO_MAX) {
      undoStack.value.shift()
    }
  }

  /**
   * Annule la dernière action de combat (Ctrl+Z).
   * @returns {boolean} true si un undo a été effectué
   */
  function undo() {
    if (undoStack.value.length === 0) return false
    const snapshot = undoStack.value.pop()
    liveAdversaries.value = snapshot.liveAdversaries
    combatLog.value = snapshot.combatLog
    encounterLog.value = snapshot.encounterLog
    pcDownStatus.value = snapshot.pcDownStatus
    pcConditions.value = snapshot.pcConditions
    activeAdversaryId.value = snapshot.activeAdversaryId
    persistState()
    return true
  }

  /**
   * Vide la pile d'undo (appelé par resetLive).
   */
  function clearUndo() {
    undoStack.value = []
  }

  return { undoStack, pushUndo, undo, clearUndo }
}
