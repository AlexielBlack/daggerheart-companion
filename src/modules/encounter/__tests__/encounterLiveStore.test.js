/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEncounterLiveStore } from '../stores/encounterLiveStore'
import {
  SCENE_MODE_PC_ATTACK,
  SCENE_MODE_ADVERSARY_ATTACK,
  SCENE_MODE_SOCIAL,
  SCENE_MODE_TRAVERSAL,
  MAX_FEAR,
  MAX_HOPE,
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

    it('fear et hope sont à 0', () => {
      expect(store.fear).toBe(0)
      expect(store.hope).toBe(0)
    })

    it('mode de scène par défaut = pcAttack', () => {
      expect(store.sceneMode).toBe(SCENE_MODE_PC_ATTACK)
    })

    it('projecteur côté PJ par défaut', () => {
      expect(store.spotlight).toBe(SPOTLIGHT_PC)
      expect(store.isPlayerSpotlight).toBe(true)
      expect(store.isGmSpotlight).toBe(false)
    })

    it('round 1 par défaut', () => {
      expect(store.round).toBe(1)
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
      // acid-burrower × 1 + asp × 2 = 3 instances
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

    it('initialise Hope = nombre de PJs', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      expect(store.hope).toBe(3)
    })

    it('initialise Fear = 0', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      expect(store.fear).toBe(0)
    })

    it('ne plante pas avec des données null', () => {
      store.startEncounter(null)
      expect(store.isActive).toBe(false)
    })

    it('reset correctement avant de relancer', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      store.addFear(5)
      store.startEncounter(MOCK_BUILDER_DATA)
      expect(store.fear).toBe(0)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Fear / Hope
  // ═══════════════════════════════════════════════════════

  describe('fear / hope', () => {
    beforeEach(() => {
      store.startEncounter(MOCK_BUILDER_DATA)
    })

    it('addFear augmente la fear', () => {
      store.addFear(3)
      expect(store.fear).toBe(3)
    })

    it('addFear ne dépasse pas MAX_FEAR', () => {
      store.addFear(MAX_FEAR + 5)
      expect(store.fear).toBe(MAX_FEAR)
    })

    it('spendFear réduit la fear', () => {
      store.addFear(5)
      const success = store.spendFear(3)
      expect(success).toBe(true)
      expect(store.fear).toBe(2)
    })

    it('spendFear échoue si pas assez', () => {
      store.addFear(2)
      const success = store.spendFear(5)
      expect(success).toBe(false)
      expect(store.fear).toBe(2) // inchangé
    })

    it('addHope augmente la hope', () => {
      store.addHope(2)
      expect(store.hope).toBe(5) // 3 initial + 2
    })

    it('addHope ne dépasse pas MAX_HOPE', () => {
      store.addHope(MAX_HOPE + 5)
      expect(store.hope).toBe(MAX_HOPE)
    })

    it('spendHope réduit la hope', () => {
      const success = store.spendHope(2)
      expect(success).toBe(true)
      expect(store.hope).toBe(1) // 3 - 2
    })

    it('spendHope échoue si pas assez', () => {
      const success = store.spendHope(10)
      expect(success).toBe(false)
      expect(store.hope).toBe(3)
    })

    it('enregistre l\'historique Fear/Hope', () => {
      store.addFear(1, 'Momentum')
      store.addHope(1, 'Action roll')
      expect(store.fearHopeHistory).toHaveLength(2)
      expect(store.fearHopeHistory[0].type).toBe('fear')
      expect(store.fearHopeHistory[0].delta).toBe(1)
      expect(store.fearHopeHistory[0].reason).toBe('Momentum')
      expect(store.fearHopeHistory[1].type).toBe('hope')
    })

    it('dépense de fear/hope enregistre delta négatif', () => {
      store.addFear(5)
      store.spendFear(2, 'GM move')
      const lastEntry = store.fearHopeHistory[store.fearHopeHistory.length - 1]
      expect(lastEntry.delta).toBe(-2)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Mode de scène
  // ═══════════════════════════════════════════════════════

  describe('mode de scène', () => {
    it('change le mode avec setSceneMode', () => {
      store.setSceneMode(SCENE_MODE_SOCIAL)
      expect(store.sceneMode).toBe(SCENE_MODE_SOCIAL)
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

    it('supporte les 4 modes', () => {
      const modes = [SCENE_MODE_PC_ATTACK, SCENE_MODE_ADVERSARY_ATTACK, SCENE_MODE_SOCIAL, SCENE_MODE_TRAVERSAL]
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
      store.setActivePc('unknown-pc')
      expect(store.activePcId).toBe('pc-1') // inchangé
    })

    it('setActiveAdversary change l\'adversaire actif', () => {
      const second = store.liveAdversaries[1]
      store.setActiveAdversary(second.instanceId)
      expect(store.activeAdversaryId).toBe(second.instanceId)
    })

    it('setActiveAdversary refuse un ID inexistant', () => {
      const original = store.activeAdversaryId
      store.setActiveAdversary('fake-id')
      expect(store.activeAdversaryId).toBe(original)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Adversaire live — HP / Stress / Conditions
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
      store.clearAdversaryHP(instanceId, 5)
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
      store.markAdversaryHP(instanceId, 1)
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.markedHP).toBe(0) // inchangé car vaincu
    })
  })

  describe('adversaire live — Conditions', () => {
    let instanceId

    beforeEach(() => {
      store.startEncounter(MOCK_BUILDER_DATA)
      instanceId = store.liveAdversaries[0].instanceId
    })

    it('ajoute une condition', () => {
      store.addAdversaryCondition(instanceId, 'Restrained')
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.conditions).toContain('Restrained')
    })

    it('ne duplique pas une condition existante', () => {
      store.addAdversaryCondition(instanceId, 'Restrained')
      store.addAdversaryCondition(instanceId, 'Restrained')
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.conditions.filter((c) => c === 'Restrained')).toHaveLength(1)
    })

    it('retire une condition', () => {
      store.addAdversaryCondition(instanceId, 'Restrained')
      store.removeAdversaryCondition(instanceId, 'Restrained')
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.conditions).not.toContain('Restrained')
    })
  })

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
      store.setActiveAdversary(instanceId)
      store.defeatAdversary(instanceId)
      // Devrait sélectionner le prochain non-vaincu
      if (store.activeAdversaries.length > 0) {
        expect(store.activeAdversaryId).toBe(store.activeAdversaries[0].instanceId)
      } else {
        expect(store.activeAdversaryId).toBeNull()
      }
    })

    it('reviveAdversary réanime', () => {
      store.defeatAdversary(instanceId)
      store.reviveAdversary(instanceId)
      const adv = store.liveAdversaries.find((a) => a.instanceId === instanceId)
      expect(adv.isDefeated).toBe(false)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  adversaryCombatSummary
  // ═══════════════════════════════════════════════════════

  describe('adversaryCombatSummary', () => {
    it('calcule les totaux des adversaires actifs', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      const summary = store.adversaryCombatSummary
      expect(summary.count).toBe(3) // 1 + 2 instances
      expect(summary.totalHP).toBeGreaterThan(0)
      expect(summary.markedHP).toBe(0)
    })

    it('exclut les vaincus', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      store.defeatAdversary(store.liveAdversaries[0].instanceId)
      expect(store.adversaryCombatSummary.count).toBe(2)
    })
  })

  // ═══════════════════════════════════════════════════════
  //  Rounds
  // ═══════════════════════════════════════════════════════

  describe('rounds', () => {
    it('nextRound incrémente', () => {
      store.nextRound()
      expect(store.round).toBe(2)
    })

    it('previousRound décrémente', () => {
      store.nextRound()
      store.nextRound()
      store.previousRound()
      expect(store.round).toBe(2)
    })

    it('previousRound ne descend pas sous 1', () => {
      store.previousRound()
      expect(store.round).toBe(1)
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
      expect(state.fear).toBe(0)
      expect(state.hope).toBe(3)
      expect(state.liveAdversaries).toHaveLength(3)
      expect(state.participantPcIds).toEqual(['pc-1', 'pc-2', 'pc-3'])
    })

    it('restoreState restaure depuis le localStorage', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      store.addFear(5, 'test')
      store.setSceneMode(SCENE_MODE_SOCIAL)
      store.nextRound()

      // Nouveau store = simule un refresh
      setActivePinia(createPinia())
      const freshStore = useEncounterLiveStore()
      expect(freshStore.isActive).toBe(false) // pas encore restauré

      const restored = freshStore.restoreState()
      expect(restored).toBe(true)
      expect(freshStore.isActive).toBe(true)
      expect(freshStore.fear).toBe(5)
      expect(freshStore.sceneMode).toBe(SCENE_MODE_SOCIAL)
      expect(freshStore.round).toBe(2)
      expect(freshStore.liveAdversaries).toHaveLength(3)
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
      store.addFear(10)
      store.setSceneMode(SCENE_MODE_TRAVERSAL)
      store.resetLive()

      expect(store.isActive).toBe(false)
      expect(store.fear).toBe(0)
      expect(store.hope).toBe(0)
      expect(store.liveAdversaries).toHaveLength(0)
      expect(store.sceneMode).toBe(SCENE_MODE_PC_ATTACK)
      expect(store.round).toBe(1)
    })

    it('endEncounter fait la même chose que resetLive', () => {
      store.startEncounter(MOCK_BUILDER_DATA)
      store.endEncounter()
      expect(store.isActive).toBe(false)
      expect(store.liveAdversaries).toHaveLength(0)
    })
  })
})
