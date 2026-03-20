// Composable useActionBar — logique singleton du bandeau de ciblage d'actions
// État module-level = singleton partagé entre tous les consommateurs

import { ref, computed } from 'vue'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import { useCharacterStore } from '@modules/characters/stores/characterStore'
import { ACTION_EFFECTS, ACTION_EFFECT_META } from '@data/encounters/actionEffects'

// État module-level = singleton partagé entre tous les consommateurs
const pendingAction = ref(null)
let actionCounter = 0

export function useActionBar () {
  const store = useEncounterLiveStore()
  const charStore = useCharacterStore()

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

  /** Applique l'action en cours : dispatch vers les fonctions store appropriées */
  function applyAction () {
    if (!pendingAction.value || !canApply.value) return

    const { effect, condition, targets } = pendingAction.value
    const actionId = generateActionId()
    const actorName = getActorName()
    const actorId = pendingAction.value.actorId

    // Un seul pushUndo avant toutes les mutations
    if (effect !== ACTION_EFFECTS.MISS) {
      store.pushUndo('Action: ' + (ACTION_EFFECT_META[effect]?.label || effect))
    }

    const skipOpt = { skipUndo: true, skipLog: true }
    const logCtx = { actionId, actorId, actorName }

    switch (effect) {
      case ACTION_EFFECTS.DAMAGE_HP:
        for (const t of targets) {
          if (t.type === 'adversary') {
            store.markAdversaryHP(t.id, t.amount, skipOpt)
            const adv = store.liveAdversaries.find(a => a.instanceId === t.id)
            store.logActionEntry({ ...logCtx, action: 'damage', instanceId: t.id, advName: adv?.name, type: 'hp', amount: t.amount })
          }
          // PJ : currentHP = dégâts marqués, augmente quand on prend des dégâts
          if (t.type === 'pc') {
            const char = charStore.characters.find(c => c.id === t.id)
            if (char) {
              charStore.patchCharacterById(t.id, { currentHP: Math.min(char.currentHP + t.amount, char.maxHP) })
              store.logActionEntry({ ...logCtx, action: 'pc_hit', pcId: t.id, pcName: char.name, type: 'hp', amount: t.amount })
            }
          }
        }
        break

      case ACTION_EFFECTS.DAMAGE_STRESS:
        for (const t of targets) {
          if (t.type === 'adversary') {
            store.markAdversaryStress(t.id, t.amount, skipOpt)
            const adv = store.liveAdversaries.find(a => a.instanceId === t.id)
            store.logActionEntry({ ...logCtx, action: 'damage', instanceId: t.id, advName: adv?.name, type: 'stress', amount: t.amount })
          }
          // PJ : currentStress = stress marqué, augmente quand on prend du stress
          if (t.type === 'pc') {
            const char = charStore.characters.find(c => c.id === t.id)
            if (char) {
              charStore.patchCharacterById(t.id, { currentStress: Math.min(char.currentStress + t.amount, char.maxStress) })
              store.logActionEntry({ ...logCtx, action: 'pc_hit', pcId: t.id, pcName: char.name, type: 'stress', amount: t.amount })
            }
          }
        }
        break

      case ACTION_EFFECTS.HEAL_HP:
        for (const t of targets) {
          if (t.type === 'adversary') {
            store.clearAdversaryHP(t.id, t.amount, skipOpt)
            const adv = store.liveAdversaries.find(a => a.instanceId === t.id)
            store.logActionEntry({ ...logCtx, action: 'heal_hp', instanceId: t.id, advName: adv?.name, amount: t.amount })
          }
          // PJ : currentHP = dégâts marqués, diminue quand on soigne
          if (t.type === 'pc') {
            const char = charStore.characters.find(c => c.id === t.id)
            if (char) {
              charStore.patchCharacterById(t.id, { currentHP: Math.max(0, char.currentHP - t.amount) })
              store.logActionEntry({ ...logCtx, action: 'heal_hp', pcId: t.id, pcName: char.name, amount: t.amount })
            }
          }
        }
        break

      case ACTION_EFFECTS.HEAL_STRESS:
        for (const t of targets) {
          if (t.type === 'adversary') {
            store.clearAdversaryStress(t.id, t.amount, skipOpt)
            const adv = store.liveAdversaries.find(a => a.instanceId === t.id)
            store.logActionEntry({ ...logCtx, action: 'heal_stress', instanceId: t.id, advName: adv?.name, amount: t.amount })
          }
          // PJ : currentStress = stress marqué, diminue quand on soigne
          if (t.type === 'pc') {
            const char = charStore.characters.find(c => c.id === t.id)
            if (char) {
              charStore.patchCharacterById(t.id, { currentStress: Math.max(0, char.currentStress - t.amount) })
              store.logActionEntry({ ...logCtx, action: 'heal_stress', pcId: t.id, pcName: char.name, amount: t.amount })
            }
          }
        }
        break

      case ACTION_EFFECTS.CONDITION:
        for (const t of targets) {
          if (t.type === 'adversary') {
            store.toggleAdversaryCondition(t.id, condition, { skipUndo: true })
          } else {
            store.togglePcCondition(t.id, condition, { skipUndo: true })
          }
          store.logActionEntry({ ...logCtx, action: 'condition_add', instanceId: t.type === 'adversary' ? t.id : undefined, pcId: t.type === 'pc' ? t.id : undefined, condition })
        }
        break

      case ACTION_EFFECTS.DOWN:
        for (const t of targets) {
          if (t.type === 'adversary') {
            const adv = store.liveAdversaries.find(a => a.instanceId === t.id)
            if (adv?.isDefeated) {
              store.reviveAdversary(t.id, { skipUndo: true, skipLog: true })
            } else {
              store.defeatAdversary(t.id, { skipUndo: true, skipLog: true })
            }
            store.logActionEntry({ ...logCtx, action: 'down', instanceId: t.id, advName: adv?.name })
          }
          // PJ : toggle du statut à terre
          if (t.type === 'pc') {
            const current = store.pcDownStatus[t.id] || false
            store.pcDownStatus[t.id] = !current
            const pc = store.participantPcs.find(p => p.id === t.id)
            store.logActionEntry({ ...logCtx, action: current ? 'pc_revive' : 'pc_down', pcId: t.id, pcName: pc?.name })
          }
        }
        break

      case ACTION_EFFECTS.HOPE:
        for (const t of targets) {
          const char = charStore.characters.find(c => c.id === t.id)
          if (char) {
            charStore.patchCharacterById(t.id, { hope: char.hope + t.amount })
            store.logActionEntry({ ...logCtx, action: 'hope_change', pcId: t.id, pcName: char.name, amount: t.amount })
          }
        }
        break

      case ACTION_EFFECTS.MISS:
        store.logActionEntry({ ...logCtx, action: 'miss' })
        break
    }

    cancelAction()
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
    applyAction,
    cancelAction
  }
}

// Export pour les tests : reset du singleton
export function _resetActionBar () {
  pendingAction.value = null
  actionCounter = 0
}
