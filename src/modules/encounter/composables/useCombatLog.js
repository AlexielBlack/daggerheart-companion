/**
 * @module encounter/composables/useCombatLog
 * @description Gestion du journal de combat et des événements PJ
 * (dégâts reçus, à terre, armure, ratés, conditions).
 *
 * @param {Object} deps - Refs et fonctions injectées depuis le store
 * @param {import('vue').Ref<Array>} deps.combatLog
 * @param {import('vue').Ref<Array>} deps.encounterLog
 * @param {import('vue').Ref<Array>} deps.liveAdversaries
 * @param {import('vue').Ref<string|null>} deps.activePcId
 * @param {import('vue').ComputedRef<Array>} deps.participantPcs
 * @param {import('vue').ComputedRef<Object|null>} deps.activeAdversary
 * @param {import('vue').Ref<Object>} deps.pcDownStatus
 * @param {import('vue').Ref<Object>} deps.pcConditions
 * @param {Function} deps.pushUndo
 * @param {Function} deps.persistState
 */

export function useCombatLog(deps) {
  const {
    combatLog,
    encounterLog,
    liveAdversaries,
    activePcId,
    participantPcs,
    activeAdversary,
    pcDownStatus,
    pcConditions,
    pushUndo,
    persistState
  } = deps

  // ── Conditions (PJ et Adversaire) ─────────────────────

  /**
   * Toggle une condition sur un PJ.
   * @param {string} pcId
   * @param {string} condition
   */
  function togglePcCondition(pcId, condition, { skipUndo = false } = {}) {
    if (!skipUndo) pushUndo()
    if (!pcConditions.value[pcId]) {
      pcConditions.value[pcId] = []
    }
    const idx = pcConditions.value[pcId].indexOf(condition)
    const pc = participantPcs.value.find((p) => p.id === pcId)
    if (idx >= 0) {
      pcConditions.value[pcId].splice(idx, 1)
      encounterLog.value.push({
        action: 'condition_removed',
        entityType: 'pc',
        entityId: pcId,
        entityName: pc ? pc.name : '?',
        condition,
        timestamp: Date.now()
      })
    } else {
      pcConditions.value[pcId].push(condition)
      encounterLog.value.push({
        action: 'condition_added',
        entityType: 'pc',
        entityId: pcId,
        entityName: pc ? pc.name : '?',
        condition,
        timestamp: Date.now()
      })
    }
    pcConditions.value = { ...pcConditions.value }
    persistState()
  }

  /**
   * Toggle une condition sur un adversaire.
   * @param {string} instanceId
   * @param {string} condition
   */
  function toggleAdversaryCondition(instanceId, condition, { skipUndo = false } = {}) {
    if (!skipUndo) pushUndo()
    const adv = liveAdversaries.value.find((a) => a.instanceId === instanceId)
    if (!adv) return
    const idx = adv.conditions.indexOf(condition)
    if (idx >= 0) {
      adv.conditions.splice(idx, 1)
      encounterLog.value.push({
        action: 'condition_removed',
        entityType: 'adversary',
        entityId: instanceId,
        entityName: adv.name,
        condition,
        timestamp: Date.now()
      })
    } else {
      adv.conditions.push(condition)
      encounterLog.value.push({
        action: 'condition_added',
        entityType: 'adversary',
        entityId: instanceId,
        entityName: adv.name,
        condition,
        timestamp: Date.now()
      })
    }
    persistState()
  }

  // ── Combat log entries ─────────────────────────────────

  /**
   * Supprime une entrée du combat log (pastille cliquée par erreur).
   * @param {number} index - Index dans combatLog
   */
  function removeCombatLogEntry(index) {
    if (index < 0 || index >= combatLog.value.length) return
    pushUndo()
    const entry = combatLog.value[index]
    combatLog.value.splice(index, 1)
    encounterLog.value.push({
      ...entry,
      action: 'damage_removed',
      timestamp: Date.now()
    })
    persistState()
  }

  // ── PJ touché (par un adversaire) ─────────────────────

  /**
   * Enregistre qu'un PJ a pris des dégâts de l'adversaire actif.
   * @param {string} pcId
   * @param {number} hpAmount
   */
  function logPcHit(pcId, hpAmount) {
    pushUndo()
    const pc = participantPcs.value.find((p) => p.id === pcId)
    const adv = activeAdversary.value
    if (!pc) return
    const entry = {
      action: 'pc_hit',
      pcId,
      pcName: pc.name,
      instanceId: adv ? adv.instanceId : null,
      advName: adv ? adv.name : '?',
      hpMarked: hpAmount,
      timestamp: Date.now()
    }
    combatLog.value.push(entry)
    encounterLog.value.push(entry)
    persistState()
  }

  /**
   * Met un PJ à terre (ou annule si déjà à terre).
   * @param {string} pcId
   * @returns {boolean} true si mis à terre, false si annulé
   */
  function logPcDown(pcId) {
    pushUndo()
    const pc = participantPcs.value.find((p) => p.id === pcId)
    const adv = activeAdversary.value
    if (!pc) return false

    if (pcDownStatus.value[pcId]) {
      delete pcDownStatus.value[pcId]
      pcDownStatus.value = { ...pcDownStatus.value }
      encounterLog.value.push({
        action: 'pc_down_cancelled',
        pcId,
        pcName: pc.name,
        timestamp: Date.now()
      })
      persistState()
      return false
    }

    pcDownStatus.value[pcId] = true
    pcDownStatus.value = { ...pcDownStatus.value }
    encounterLog.value.push({
      action: 'pc_down',
      pcId,
      pcName: pc.name,
      instanceId: adv ? adv.instanceId : null,
      advName: adv ? adv.name : '?',
      timestamp: Date.now()
    })
    persistState()
    return true
  }

  /**
   * Réanime un PJ à terre.
   * @param {string} pcId
   */
  function logPcRevive(pcId) {
    pushUndo()
    const pc = participantPcs.value.find((p) => p.id === pcId)
    if (!pc || !pcDownStatus.value[pcId]) return
    delete pcDownStatus.value[pcId]
    pcDownStatus.value = { ...pcDownStatus.value }
    encounterLog.value.push({
      action: 'pc_revive',
      pcId,
      pcName: pc.name,
      timestamp: Date.now()
    })
    persistState()
  }

  /**
   * Enregistre qu'un PJ a utilisé un slot d'armure.
   * @param {string} pcId
   */
  function logPcArmorUsed(pcId) {
    pushUndo()
    const pc = participantPcs.value.find((p) => p.id === pcId)
    const adv = activeAdversary.value
    if (!pc) return
    const entry = {
      action: 'pc_armor',
      pcId,
      pcName: pc.name,
      instanceId: adv ? adv.instanceId : null,
      advName: adv ? adv.name : '?',
      timestamp: Date.now()
    }
    combatLog.value.push(entry)
    encounterLog.value.push(entry)
    persistState()
  }

  /**
   * Enregistre une attaque ratée.
   * @param {string} attackerType - 'pc' ou 'adversary'
   */
  function logMiss(attackerType) {
    pushUndo()
    const pc = participantPcs.value.find((p) => p.id === activePcId.value)
    const adv = activeAdversary.value
    const entry = {
      action: 'miss',
      attackerType,
      pcId: activePcId.value || null,
      pcName: pc ? pc.name : '?',
      instanceId: adv ? adv.instanceId : null,
      advName: adv ? adv.name : '?',
      timestamp: Date.now()
    }
    combatLog.value.push(entry)
    encounterLog.value.push(entry)
    persistState()
  }

  return {
    togglePcCondition,
    toggleAdversaryCondition,
    removeCombatLogEntry,
    logPcHit,
    logPcDown,
    logPcRevive,
    logPcArmorUsed,
    logMiss
  }
}
