/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import {
  SCENE_MODE_PC_ATTACK,
  SCENE_MODE_ADVERSARY_ATTACK,
  SCENE_MODE_SOCIAL,
  SPOTLIGHT_PC,
  SPOTLIGHT_GM
} from '@data/encounters/liveConstants'

// ── Données de test ──────────────────────────────────────

/** Simulation d'un résultat de serializeEncounter() du builder */
const MOCK_BUILDER_DATA = {
  id: 'test-123',
  name: 'Combat test',
  pcCount: 3,
  tier: 2,
  intensity: 'standard',
  adjustments: [],
  adversarySlots: [
    { adversaryId: 'acid-burrower', quantity: 1 },
    { adversaryId: 'bear', quantity: 2 }
  ],
  environmentId: null,
  selectedPcIds: ['pc-1', 'pc-2', 'pc-3'],
  createdAt: new Date().toISOString()
}

describe('encounterLiveStore', () => {
  let store

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    store = useEncounterLiveStore()
  })

  // ═══════════════════════════════════════════════════════
  //  État initial
  // ═══════════════════════════════════════════════════════

  describe('état initial', () => {
    it('n\'est pas actif par défaut', () => {
      expect(store.isActive).toBe(false)
    })

    it('mode de scène par défaut = pcAttack', () => {
      expect(store.sceneMode).toBe(SCENE_MODE_PC_ATTACK)
    })

    it('projecteur côté PJ par défaut', () => {
      expect(store.spotlight).toBe(SPOTLIGHT_PC)
      expect(store.isPlayerSpotlight).toBe(true)
      expect(store.isGmSpotlight).toBe(false)
    })

    it('aucun adversaire live', () => {
      expect(store.liveAdversaries).toHaveLength(0)
      expect(store.activeAdversaries).toHaveLength(0)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Initialisation depuis le builder
  // ═══════════════════════════════════════════════════════

  describe('startEncounter', () => {
    it('active la rencontre', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      expect(store.isActive).toBe(true)
    })

    it('charge le nom et le tier', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      expect(store.encounterName).toBe('Combat test')
      expect(store.encounterTier).toBe(2)
    })

    it('charge les PJs participants', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      expect(store.participantPcIds).toEqual(['pc-1', 'pc-2', 'pc-3'])
    })

    it('sélectionne le premier PJ par défaut', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      expect(store.activePcId).toBe('pc-1')
    })

    it('crée les instances live d\'adversaires', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      // acid-burrower × 1 + bear × 2 = 3 instances
      expect(store.liveAdversaries.length).toBe(3)
    })

    it('chaque instance a un instanceId unique', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      const ids = store.liveAdversaries.map((a) => a.instanceId)
      const uniqueIds = new Set(ids)
      expect(uniqueIds.size).toBe(3)
    })

    it('les adversaires commencent avec 0 HP/Stress marqués', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      for (const adv of store.liveAdversaries) {
        expect(adv.markedHP).toBe(0)
        expect(adv.markedStress).toBe(0)
        expect(adv.conditions).toEqual([])
        expect(adv.isDefeated).toBe(false)
      }
    })

    it('sélectionne le premier adversaire par défaut', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      expect(store.activeAdversaryId).toBe(store.liveAdversaries[0].instanceId)
    })

    it('ne plante pas avec des données null', () => {
      store.startEncounter(null)
      expect(store.isActive).toBe(false)
    })

    it('reset correctement avant de relancer', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      store.markAdversaryHP(store.liveAdversaries[0].instanceId, 5)
      store.startEncounter(MOCK_BUILDER_DATA)
      expect(store.liveAdversaries[0].markedHP).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Mode de scène
  // ═══════════════════════════════════════════════════════

  describe('mode de scène', () => {
    it('change le mode avec setSceneMode', () => {
      store.setSceneMode(SCENE_MODE_ADVERSARY_ATTACK)
      expect(store.sceneMode).toBe(SCENE_MODE_ADVERSARY_ATTACK)
    })

    it('refuse un mode invalide', () => {
      store.setSceneMode('invalid-mode')
      expect(store.sceneMode).toBe(SCENE_MODE_PC_ATTACK) // inchangé
    })

    it('currentSceneModeMeta retourne les bonnes métadonnées', () => {
      store.setSceneMode(SCENE_MODE_ADVERSARY_ATTACK)
      expect(store.currentSceneModeMeta.label).toBe('Adversaire Attaque')
      expect(store.currentSceneModeMeta.primaryTags).toContain('défensif')
    })

    it('supporte les 3 modes actifs', () => {
      const modes = [SCENE_MODE_PC_ATTACK, SCENE_MODE_ADVERSARY_ATTACK, SCENE_MODE_SOCIAL]
      for (const mode of modes) {
        store.setSceneMode(mode)
        expect(store.sceneMode).toBe(mode)
        expect(store.currentSceneModeMeta.label).toBeTruthy()
      }
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Projecteur (Spotlight)
  // ═══════════════════════════════════════════════════════

  describe('projecteur', () => {
    it('setPlayerSpotlight met le projecteur côté PJ', () => {
      store.setGmSpotlight()
      store.setPlayerSpotlight()
      expect(store.spotlight).toBe(SPOTLIGHT_PC)
      expect(store.isPlayerSpotlight).toBe(true)
    })

    it('setGmSpotlight met le projecteur côté MJ', () => {
      store.setGmSpotlight()
      expect(store.spotlight).toBe(SPOTLIGHT_GM)
      expect(store.isGmSpotlight).toBe(true)
    })

    it('toggleSpotlight bascule', () => {
      expect(store.spotlight).toBe(SPOTLIGHT_PC)
      store.toggleSpotlight()
      expect(store.spotlight).toBe(SPOTLIGHT_GM)
      store.toggleSpotlight()
      expect(store.spotlight).toBe(SPOTLIGHT_PC)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Sélection PJ / Adversaire actif
  // ═══════════════════════════════════════════════════════

  describe('sélection active', () => {
    beforeEach(() => {
      store.startEncounter(MOCK_BUILDER_DATA)
    })

    it('setActivePc change le PJ actif', () => {
      store.setActivePc('pc-2')
      expect(store.activePcId).toBe('pc-2')
    })

    it('setActivePc refuse un PJ non-participant', () => {
      store.setActivePc('unknown')
      expect(store.activePcId).toBe('pc-1') // inchangé
    })

    it('setActiveAdversary change l\'adversaire actif', () => {
      const secondId = store.liveAdversaries[1].instanceId
      store.setActiveAdversary(secondId)
      expect(store.activeAdversaryId).toBe(secondId)
    })

    it('setActiveAdversary refuse un ID inexistant', () => {
      const originalId = store.activeAdversaryId
      store.setActiveAdversary('nonexistent')
      expect(store.activeAdversaryId).toBe(originalId)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Adversaire live — HP / Stress
  // ═══════════════════════════════════════════════════════

  describe('adversaire live — HP / Stress', () => {
    let instanceId

    beforeEach(() => {
      store.startEncounter(MOCK_BUILDER_DATA)
      instanceId = store.liveAdversaries[0].instanceId
    })

    it('markAdversaryHP augmente les HP marqués', () => {
      store.markAdversaryHP(instanceId, 3)
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.markedHP).toBe(3)
    })

    it('markAdversaryHP ne dépasse pas maxHP', () => {
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      store.markAdversaryHP(instanceId, adv.maxHP + 10)
      expect(adv.markedHP).toBe(adv.maxHP)
    })

    it('clearAdversaryHP réduit les HP marqués', () => {
      store.markAdversaryHP(instanceId, 5)
      store.clearAdversaryHP(instanceId, 2)
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.markedHP).toBe(3)
    })

    it('clearAdversaryHP ne descend pas sous 0', () => {
      store.clearAdversaryHP(instanceId, 10)
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.markedHP).toBe(0)
    })

    it('markAdversaryStress augmente le stress marqué', () => {
      store.markAdversaryStress(instanceId, 2)
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.markedStress).toBe(2)
    })

    it('markAdversaryStress ne dépasse pas maxStress', () => {
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      store.markAdversaryStress(instanceId, adv.maxStress + 10)
      expect(adv.markedStress).toBe(adv.maxStress)
    })

    it('ne marque pas un adversaire vaincu', () => {
      store.defeatAdversary(instanceId)
      store.markAdversaryHP(instanceId, 5)
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.markedHP).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Adversaire live — Conditions
  // ═══════════════════════════════════════════════════════

  describe('adversaire live — Conditions', () => {
    let instanceId

    beforeEach(() => {
      store.startEncounter(MOCK_BUILDER_DATA)
      instanceId = store.liveAdversaries[0].instanceId
    })

    it('ajoute une condition', () => {
      store.addAdversaryCondition(instanceId, 'hidden')
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.conditions).toContain('hidden')
    })

    it('ne duplique pas une condition existante', () => {
      store.addAdversaryCondition(instanceId, 'hidden')
      store.addAdversaryCondition(instanceId, 'hidden')
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.conditions.filter((c) => c === 'hidden')).toHaveLength(1)
    })

    it('retire une condition', () => {
      store.addAdversaryCondition(instanceId, 'hidden')
      store.removeAdversaryCondition(instanceId, 'hidden')
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.conditions).not.toContain('hidden')
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Adversaire live — Défaite / Revival
  // ═══════════════════════════════════════════════════════

  describe('adversaire live — Défaite / Revival', () => {
    let instanceId

    beforeEach(() => {
      store.startEncounter(MOCK_BUILDER_DATA)
      instanceId = store.liveAdversaries[0].instanceId
    })

    it('defeatAdversary marque comme vaincu', () => {
      store.defeatAdversary(instanceId)
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.isDefeated).toBe(true)
    })

    it('un vaincu disparaît des activeAdversaries', () => {
      const countBefore = store.activeAdversaries.length
      store.defeatAdversary(instanceId)
      expect(store.activeAdversaries.length).toBe(countBefore - 1)
    })

    it('un vaincu apparaît dans defeatedAdversaries', () => {
      store.defeatAdversary(instanceId)
      expect(store.defeatedAdversaries.length).toBe(1)
    })

    it('vaincre l\'adversaire actif sélectionne le suivant', () => {
      // L'adversaire actif est le premier
      expect(store.activeAdversaryId).toBe(instanceId)
      store.defeatAdversary(instanceId)
      // Un autre adversaire devrait être sélectionné
      expect(store.activeAdversaryId).not.toBe(instanceId)
      expect(store.activeAdversaryId).toBeTruthy()
    })

    it('reviveAdversary réanime', () => {
      store.defeatAdversary(instanceId)
      expect(store.defeatedAdversaries.length).toBe(1)
      store.reviveAdversary(instanceId)
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.isDefeated).toBe(false)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Résumé combat
  // ═══════════════════════════════════════════════════════

  describe('adversaryCombatSummary', () => {
    it('calcule les totaux des adversaires actifs', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      const summary = store.adversaryCombatSummary
      expect(summary.count).toBe(3)
      expect(summary.totalHP).toBeGreaterThan(0)
      expect(summary.markedHP).toBe(0)
    })

    it('exclut les vaincus', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      const totalBefore = store.adversaryCombatSummary.count
      store.defeatAdversary(store.liveAdversaries[0].instanceId)
      expect(store.adversaryCombatSummary.count).toBe(totalBefore - 1)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Persistence
  // ═══════════════════════════════════════════════════════

  describe('persistence', () => {
    it('serializeLiveState retourne un snapshot complet', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      const state = store.serializeLiveState()
      expect(state.isActive).toBe(true)
      expect(state.encounterName).toBe('Combat test')
      expect(state.liveAdversaries).toHaveLength(3)
      expect(state.participantPcIds).toEqual(['pc-1', 'pc-2', 'pc-3'])
    })

    it('restoreState restaure depuis le localStorage', () => {
      vi.useFakeTimers()
      store.startEncounter(MOCK_BUILDER_DATA)
      store.setSceneMode(SCENE_MODE_ADVERSARY_ATTACK)
      vi.advanceTimersByTime(500) // Flush du debounce persistState

      // Nouveau store = simule un refresh
      setActivePinia(createPinia())
      const freshStore = useEncounterLiveStore()
      expect(freshStore.isActive).toBe(false) // pas encore restauré

      const restored = freshStore.restoreState()
      expect(restored).toBe(true)
      expect(freshStore.isActive).toBe(true)
      expect(freshStore.sceneMode).toBe(SCENE_MODE_ADVERSARY_ATTACK)
      expect(freshStore.liveAdversaries).toHaveLength(3)
      vi.useRealTimers()
    })

    it('restoreState retourne false si rien à restaurer', () => {
      expect(store.restoreState()).toBe(false)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Reset / End
  // ═══════════════════════════════════════════════════════

  describe('resetLive / endEncounter', () => {
    it('resetLive remet tout à zéro', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      store.setSceneMode(SCENE_MODE_ADVERSARY_ATTACK)
      store.resetLive()

      expect(store.isActive).toBe(false)
      expect(store.liveAdversaries).toHaveLength(0)
      expect(store.sceneMode).toBe(SCENE_MODE_PC_ATTACK)
    })

    it('endEncounter fait la même chose que resetLive', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      store.endEncounter()
      expect(store.isActive).toBe(false)
      expect(store.liveAdversaries).toHaveLength(0)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Spotlight couche 1 (pcSpotlights / advSpotlights)
  // ═══════════════════════════════════════════════════════

  describe('spotlight couche 1', () => {
    beforeEach(() => {
      store.startEncounter(MOCK_BUILDER_DATA)
    })

    it('togglePcSpotlight incrémente le compteur', () => {
      store.togglePcSpotlight('pc-1')
      expect(store.pcSpotlights['pc-1']).toBe(1)
    })

    it('togglePcSpotlight cumule', () => {
      store.togglePcSpotlight('pc-1')
      store.togglePcSpotlight('pc-1')
      expect(store.pcSpotlights['pc-1']).toBe(2)
    })

    it('auto-reset quand tous les PJs ont joué', () => {
      store.togglePcSpotlight('pc-1')
      store.togglePcSpotlight('pc-2')
      store.togglePcSpotlight('pc-3')
      // Tous ont joué → reset automatique
      expect(store.pcSpotlights).toEqual({})
    })

    it('decrementPcSpotlight corrige une erreur', () => {
      store.togglePcSpotlight('pc-1')
      store.togglePcSpotlight('pc-1')
      store.decrementPcSpotlight('pc-1')
      expect(store.pcSpotlights['pc-1']).toBe(1)
    })

    it('decrementPcSpotlight supprime la clé à 0', () => {
      store.togglePcSpotlight('pc-1')
      store.decrementPcSpotlight('pc-1')
      expect(store.pcSpotlights['pc-1']).toBeUndefined()
    })

    it('toggleAdvSpotlight incrémente le compteur adversaire', () => {
      const advId = store.liveAdversaries[0].adversaryId
      store.toggleAdvSpotlight(advId)
      expect(store.advSpotlights[advId]).toBe(1)
    })

    it('pcSpotlights survivent à la sérialisation', () => {
      store.togglePcSpotlight('pc-1')
      const state = store.serializeLiveState()
      expect(state.pcSpotlights['pc-1']).toBe(1)
    })

    it('resetLive vide les spotlights', () => {
      store.togglePcSpotlight('pc-1')
      store.resetLive()
      expect(store.pcSpotlights).toEqual({})
      expect(store.advSpotlights).toEqual({})
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Undo (Ctrl+Z)
  // ═══════════════════════════════════════════════════════

  describe('undo', () => {
    let instanceId

    beforeEach(() => {
      store.startEncounter(MOCK_BUILDER_DATA)
      instanceId = store.liveAdversaries[0].instanceId
    })

    it('la pile d\'undo est vide au départ', () => {
      expect(store.undoStack).toHaveLength(0)
    })

    it('markAdversaryHP pousse un snapshot dans la pile', () => {
      store.markAdversaryHP(instanceId, 3)
      expect(store.undoStack.length).toBeGreaterThan(0)
    })

    it('undo restaure les HP avant markAdversaryHP', () => {
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.markedHP).toBe(0)
      store.markAdversaryHP(instanceId, 5)
      expect(adv.markedHP).toBe(5)
      const success = store.undo()
      expect(success).toBe(true)
      const restored = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(restored.markedHP).toBe(0)
    })

    it('undo restaure les conditions adversaire', () => {
      store.toggleAdversaryCondition(instanceId, 'hidden')
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.conditions).toContain('hidden')
      store.undo()
      const restored = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(restored.conditions).not.toContain('hidden')
    })

    it('undo restaure la défaite d\'un adversaire', () => {
      store.defeatAdversary(instanceId)
      expect(store.liveAdversaries.find((a) => a.instanceId === instanceId).isDefeated).toBe(true)
      store.undo()
      expect(store.liveAdversaries.find((a) => a.instanceId === instanceId).isDefeated).toBe(false)
    })

    it('undo retourne false si la pile est vide', () => {
      expect(store.undo()).toBe(false)
    })

    it('plusieurs undos successifs fonctionnent', () => {
      store.markAdversaryHP(instanceId, 2)
      store.markAdversaryStress(instanceId, 3)
      store.undo() // annule stress
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.markedStress).toBe(0)
      expect(adv.markedHP).toBe(2)
      store.undo() // annule HP
      const adv2 = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv2.markedHP).toBe(0)
    })

    it('resetLive vide la pile d\'undo', () => {
      store.markAdversaryHP(instanceId, 5)
      expect(store.undoStack.length).toBeGreaterThan(0)
      store.resetLive()
      expect(store.undoStack).toHaveLength(0)
    })

    it('la pile ne dépasse pas 50 entrées', () => {
      for (let i = 0; i < 55; i++) {
        store.markAdversaryHP(instanceId, 1)
        store.clearAdversaryHP(instanceId, 1)
      }
      expect(store.undoStack.length).toBeLessThanOrEqual(50)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  AoE — Dégâts de zone
  // ═══════════════════════════════════════════════════════

  describe('applyAoeDamage', () => {
    let instances

    beforeEach(() => {
      store.startEncounter(MOCK_BUILDER_DATA)
      instances = store.liveAdversaries
    })

    it('applique des dégâts HP à plusieurs instances', () => {
      const ids = instances.map((a) => a.instanceId)
      store.applyAoeDamage(ids, 3, 'hp')
      for (const inst of instances) {
        expect(inst.markedHP).toBe(3)
      }
    })

    it('applique des dégâts Stress à plusieurs instances', () => {
      const ids = instances.map((a) => a.instanceId)
      store.applyAoeDamage(ids, 2, 'stress')
      for (const inst of instances) {
        expect(inst.markedStress).toBe(2)
      }
    })

    it('ne dépasse pas maxHP', () => {
      const inst = instances[0]
      store.applyAoeDamage([inst.instanceId], 9999, 'hp')
      expect(inst.markedHP).toBe(inst.maxHP)
    })

    it('ignore les instances vaincues', () => {
      const inst = instances[0]
      store.defeatAdversary(inst.instanceId)
      store.applyAoeDamage([inst.instanceId], 5, 'hp')
      // Ne doit pas avoir changé
      expect(inst.markedHP).toBe(inst.markedHP)
    })

    it('crée des entrées dans le combat log pour chaque cible', () => {
      const ids = instances.filter((a) => !a.isDefeated).map((a) => a.instanceId)
      store.applyAoeDamage(ids, 2, 'hp')
      const dmgEntries = store.combatLog.filter((e) => e.action === 'damage')
      expect(dmgEntries.length).toBe(ids.length)
    })

    it('ne fait rien si la liste d\'instances est vide', () => {
      store.applyAoeDamage([], 5, 'hp')
      expect(store.combatLog).toHaveLength(0)
    })

    it('ne fait rien si le montant est 0', () => {
      const ids = instances.map((a) => a.instanceId)
      store.applyAoeDamage(ids, 0, 'hp')
      for (const inst of instances) {
        expect(inst.markedHP).toBe(0)
      }
    })

    it('défait les Minions dès le premier dégât HP', () => {
      // Trouver un Minion si disponible dans le mock
      const minion = instances.find((a) => a.type === 'Minion')
      if (!minion) return // skip si aucun minion dans les données de test
      store.applyAoeDamage([minion.instanceId], 1, 'hp')
      expect(minion.isDefeated).toBe(true)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Sélection — pas de swap au double-clic
  // ═══════════════════════════════════════════════════════

  describe('sélection sans swap (double-clic)', () => {
    beforeEach(() => {
      store.startEncounter(MOCK_BUILDER_DATA)
    })

    it('selectPc ne swap pas au clic sur le même PJ', () => {
      const pcId = store.participantPcIds[0]
      store.selectPc(pcId)
      const modeBefore = store.sceneMode
      // Re-cliquer le même PJ ne doit PAS changer le mode
      store.selectPc(pcId)
      expect(store.sceneMode).toBe(modeBefore)
    })

    it('selectAdversaryGroup ne swap pas au clic sur le même adversaire', () => {
      const advId = store.liveAdversaries[0].adversaryId
      store.selectAdversaryGroup(advId)
      const modeBefore = store.sceneMode
      // Re-cliquer le même adversaire ne doit PAS changer le mode
      store.selectAdversaryGroup(advId)
      expect(store.sceneMode).toBe(modeBefore)
    })

    it('swapSpotlight cycle entre les 3 modes', () => {
      expect(store.sceneMode).toBe(SCENE_MODE_PC_ATTACK)
      store.swapSpotlight()
      expect(store.sceneMode).toBe(SCENE_MODE_ADVERSARY_ATTACK)
      store.swapSpotlight()
      expect(store.sceneMode).toBe(SCENE_MODE_SOCIAL)
      store.swapSpotlight()
      expect(store.sceneMode).toBe(SCENE_MODE_PC_ATTACK)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  HP rapides — markAdversaryHP avec montant > 1
  // ═══════════════════════════════════════════════════════

  describe('markAdversaryHP avec montant variable', () => {
    let instanceId

    beforeEach(() => {
      store.startEncounter(MOCK_BUILDER_DATA)
      instanceId = store.liveAdversaries[0].instanceId
    })

    it('marque 5 HP en une seule action', () => {
      store.markAdversaryHP(instanceId, 5)
      expect(store.liveAdversaries[0].markedHP).toBe(5)
    })

    it('marque 10 HP en une seule action', () => {
      store.markAdversaryHP(instanceId, 10)
      const expected = Math.min(10, store.liveAdversaries[0].maxHP)
      expect(store.liveAdversaries[0].markedHP).toBe(expected)
    })

    it('ne dépasse pas maxHP avec un gros montant', () => {
      const adv = store.liveAdversaries[0]
      store.markAdversaryHP(instanceId, adv.maxHP + 100)
      expect(adv.markedHP).toBe(adv.maxHP)
    })

    it('accumule les dégâts consécutifs dans le même log entry', () => {
      // Sélectionner un PJ actif pour que le log fonctionne
      store.selectPc(store.participantPcIds[0])
      store.markAdversaryHP(instanceId, 3)
      store.markAdversaryHP(instanceId, 2)
      // Le store agrège les dégâts consécutifs du même PJ sur la même cible
      const dmgEntries = store.combatLog.filter((e) => e.action === 'damage' && e.type === 'hp')
      expect(dmgEntries.length).toBe(1)
      expect(dmgEntries[0].amount).toBe(5)
    })
  })
})
