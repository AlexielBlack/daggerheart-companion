// Composable useActionBar — logique singleton du bandeau de ciblage d'actions
// État module-level = singleton partagé entre tous les consommateurs

import { ref, computed } from 'vue'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import { ACTION_EFFECTS } from '@data/encounters/actionEffects'

// État module-level = singleton partagé entre tous les consommateurs
const pendingAction = ref(null)
let actionCounter = 0

export function useActionBar () {
  const store = useEncounterLiveStore()

  const isOpen = computed(() => pendingAction.value !== null)

  const hasTargets = computed(() =>
    pendingAction.value?.targets?.length > 0
  )

  const canApply = computed(() => {
    if (!pendingAction.value?.effect) return false
    if (pendingAction.value.effect === ACTION_EFFECTS.MISS) return true
    return hasTargets.value
  })

  /** Ouvre une nouvelle action pour l'acteur actif (spotlight) */
  function openAction () {
    const isPC = store.spotlight === 'pc'
    pendingAction.value = {
      actorId: isPC ? store.activePcId : store.activeAdversaryId,
      actorType: isPC ? 'pc' : 'adversary',
      effect: null,
      condition: null,
      targets: [],
      defaultAmount: 1
    }
  }

  /** Définit l'effet de l'action en cours */
  function setEffect (effect) {
    if (!pendingAction.value) return
    pendingAction.value.effect = effect
    pendingAction.value.condition = null
    pendingAction.value.targets = []
  }

  /** Définit la condition associée à l'action */
  function setCondition (conditionId) {
    if (!pendingAction.value) return
    pendingAction.value.condition = conditionId
  }

  /** Ajoute ou retire une cible de la sélection */
  function toggleTarget (id, type) {
    if (!pendingAction.value) return
    const targets = pendingAction.value.targets
    const idx = targets.findIndex(t => t.id === id)
    if (idx >= 0) {
      targets.splice(idx, 1)
    } else {
      targets.push({ id, type, amount: pendingAction.value.defaultAmount })
    }
  }

  /** Sélectionne tous les PJ non à terre */
  function selectAllPcs () {
    if (!pendingAction.value) return
    const pcDown = store.pcDownStatus || {}
    pendingAction.value.targets = store.participantPcs
      .filter(pc => !pcDown[pc.id])
      .map(pc => ({ id: pc.id, type: 'pc', amount: pendingAction.value.defaultAmount }))
  }

  /** Sélectionne tous les adversaires non vaincus */
  function selectAllAdversaries () {
    if (!pendingAction.value) return
    pendingAction.value.targets = store.liveAdversaries
      .filter(a => !a.isDefeated)
      .map(a => ({ id: a.instanceId, type: 'adversary', amount: pendingAction.value.defaultAmount }))
  }

  /** Sélectionne l'acteur comme sa propre cible */
  function selectSelf () {
    if (!pendingAction.value) return
    const { actorId, actorType } = pendingAction.value
    pendingAction.value.targets = [{ id: actorId, type: actorType, amount: pendingAction.value.defaultAmount }]
  }

  /** Change le montant par défaut et met à jour toutes les cibles */
  function setDefaultAmount (n) {
    if (!pendingAction.value) return
    pendingAction.value.defaultAmount = n
    pendingAction.value.targets.forEach(t => { t.amount = n })
  }

  /** Change le montant d'une cible spécifique */
  function setTargetAmount (id, n) {
    if (!pendingAction.value) return
    const target = pendingAction.value.targets.find(t => t.id === id)
    if (target) target.amount = n
  }

  /** Génère un identifiant unique pour une action */
  function generateActionId () {
    actionCounter++
    return `act_${Date.now()}_${actionCounter}`
  }

  /** Vérifie si une cible est sélectionnée */
  function isTargetSelected (id) {
    if (!pendingAction.value) return false
    return pendingAction.value.targets.some(t => t.id === id)
  }

  /** Retourne le nom de l'acteur en cours */
  function getActorName () {
    const { actorId, actorType } = pendingAction.value
    if (actorType === 'pc') {
      const pc = store.participantPcs.find(p => p.id === actorId)
      return pc?.name || actorId
    }
    const adv = store.liveAdversaries.find(a => a.instanceId === actorId)
    return adv?.name || actorId
  }

  /** Annule l'action en cours */
  function cancelAction () {
    pendingAction.value = null
  }

  return {
    pendingAction,
    isOpen,
    hasTargets,
    canApply,
    openAction,
    setEffect,
    setCondition,
    toggleTarget,
    selectAllPcs,
    selectAllAdversaries,
    selectSelf,
    setDefaultAmount,
    setTargetAmount,
    isTargetSelected,
    generateActionId,
    getActorName,
    cancelAction
  }
}

// Export pour les tests : reset du singleton
export function _resetActionBar () {
  pendingAction.value = null
  actionCounter = 0
}
