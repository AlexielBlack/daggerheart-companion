/**
 * @module encounter/composables/useSpotlights
 * @description Gestion des compteurs spotlight (couche 1) pour PJs et adversaires.
 * Auto-reset quand toutes les entités d'un camp ont joué au moins une fois.
 *
 * @param {Object} deps - Refs et fonctions injectées depuis le store
 * @param {import('vue').Ref<Object>} deps.pcSpotlights
 * @param {import('vue').Ref<Object>} deps.advSpotlights
 * @param {import('vue').Ref<Array>} deps.participantPcIds
 * @param {import('vue').ComputedRef<Array>} deps.groupedAdversaries
 * @param {import('vue').ComputedRef<Array>} deps.participantPcs
 * @param {import('vue').Ref<Array>} deps.encounterLog
 * @param {Function} deps.persistState
 */

export function useSpotlights(deps) {
  const {
    pcSpotlights,
    advSpotlights,
    participantPcIds,
    groupedAdversaries,
    participantPcs,
    encounterLog,
    persistState
  } = deps

  /**
   * Incrémente le compteur spotlight d'un PJ.
   * Si tous les PJs ont joué au moins une fois, reset automatique.
   * @param {string} pcId
   */
  function togglePcSpotlight(pcId) {
    if (!pcSpotlights.value[pcId]) {
      pcSpotlights.value[pcId] = 0
    }
    pcSpotlights.value[pcId]++
    pcSpotlights.value = { ...pcSpotlights.value }

    if (pcSpotlights.value[pcId] > 1) {
      const pc = participantPcs.value.find((p) => p.id === pcId)
      encounterLog.value.push({
        action: 'multi_spotlight',
        entityType: 'pc',
        entityId: pcId,
        entityName: pc ? pc.name : '?',
        count: pcSpotlights.value[pcId],
        timestamp: Date.now()
      })
    }

    // Auto-reset si tous les PJs ont joué au moins une fois
    const allPlayed = participantPcIds.value.length > 0 &&
      participantPcIds.value.every((id) => pcSpotlights.value[id] >= 1)
    if (allPlayed) {
      pcSpotlights.value = {}
    }
    persistState()
  }

  /**
   * Décrémente le compteur spotlight d'un PJ (correction d'erreur).
   * @param {string} pcId
   */
  function decrementPcSpotlight(pcId) {
    if (pcSpotlights.value[pcId] > 0) {
      pcSpotlights.value[pcId]--
      if (pcSpotlights.value[pcId] === 0) {
        delete pcSpotlights.value[pcId]
      }
      pcSpotlights.value = { ...pcSpotlights.value }
      persistState()
    }
  }

  /**
   * Incrémente le compteur spotlight d'un adversaire.
   * Si tous les adversaires actifs ont joué au moins une fois, reset automatique.
   * @param {string} adversaryId
   */
  function toggleAdvSpotlight(adversaryId) {
    if (!advSpotlights.value[adversaryId]) {
      advSpotlights.value[adversaryId] = 0
    }
    advSpotlights.value[adversaryId]++
    advSpotlights.value = { ...advSpotlights.value }

    if (advSpotlights.value[adversaryId] > 1) {
      const group = groupedAdversaries.value.find((g) => g.adversaryId === adversaryId)
      encounterLog.value.push({
        action: 'multi_spotlight',
        entityType: 'adversary',
        entityId: adversaryId,
        entityName: group ? group.name : '?',
        count: advSpotlights.value[adversaryId],
        timestamp: Date.now()
      })
    }

    // Auto-reset si tous les groupes actifs ont joué au moins une fois
    const activeGroups = groupedAdversaries.value.filter((g) => g.activeCount > 0)
    const allPlayed = activeGroups.length > 0 &&
      activeGroups.every((g) => advSpotlights.value[g.adversaryId] >= 1)
    if (allPlayed) {
      advSpotlights.value = {}
    }
    persistState()
  }

  /**
   * Décrémente le compteur spotlight d'un adversaire (correction d'erreur).
   * @param {string} adversaryId
   */
  function decrementAdvSpotlight(adversaryId) {
    if (advSpotlights.value[adversaryId] > 0) {
      advSpotlights.value[adversaryId]--
      if (advSpotlights.value[adversaryId] === 0) {
        delete advSpotlights.value[adversaryId]
      }
      advSpotlights.value = { ...advSpotlights.value }
      persistState()
    }
  }

  return {
    togglePcSpotlight,
    decrementPcSpotlight,
    toggleAdvSpotlight,
    decrementAdvSpotlight
  }
}
