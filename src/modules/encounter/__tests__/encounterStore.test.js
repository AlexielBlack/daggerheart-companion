import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useEncounterStore } from '../stores/encounterStore'
import { allAdversaries } from '@data/adversaries'
import {
  BATTLE_POINT_COSTS,
  BP_ADJUSTMENTS,
  SCENE_INTENSITY,
  calculateBaseBattlePoints,
  calculateAdversaryCost
} from '@data/encounters/constants'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
    get length() { return Object.keys(store).length },
    key: vi.fn((i) => Object.keys(store)[i] ?? null)
  }
})()

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

describe('encounterStore', () => {
  let store

  beforeEach(() => {
    localStorageMock.clear()
    setActivePinia(createPinia())
    store = useEncounterStore()
  })

  // ── Constantes & Helpers ──────────────────────────────

  describe('calculateBaseBattlePoints', () => {
    it('calcule (3 × PJ) + 2', () => {
      expect(calculateBaseBattlePoints(3)).toBe(11)
      expect(calculateBaseBattlePoints(4)).toBe(14)
      expect(calculateBaseBattlePoints(5)).toBe(17)
    })
  })

  describe('calculateAdversaryCost', () => {
    it('retourne le coût correct par type', () => {
      expect(calculateAdversaryCost('Minion', 1)).toBe(1)
      expect(calculateAdversaryCost('Standard', 2)).toBe(4)
      expect(calculateAdversaryCost('Solo', 1)).toBe(5)
      expect(calculateAdversaryCost('Bruiser', 3)).toBe(12)
    })

    it('utilise 2 par défaut pour les types inconnus', () => {
      expect(calculateAdversaryCost('Unknown', 1)).toBe(2)
    })
  })

  describe('constantes SRD', () => {
    it('a les coûts BP pour tous les types', () => {
      const types = ['Minion', 'Social', 'Support', 'Horde', 'Skulk', 'Standard', 'Leader', 'Bruiser', 'Solo']
      types.forEach((type) => {
        expect(BATTLE_POINT_COSTS[type]).toBeGreaterThan(0)
      })
    })

    it('a 6 ajustements disponibles', () => {
      expect(BP_ADJUSTMENTS).toHaveLength(6)
      BP_ADJUSTMENTS.forEach((adj) => {
        expect(adj).toHaveProperty('id')
        expect(adj).toHaveProperty('value')
        expect(adj).toHaveProperty('label')
      })
    })

    it('a 5 niveaux d\'intensité', () => {
      expect(SCENE_INTENSITY).toHaveLength(5)
      SCENE_INTENSITY.forEach((s) => {
        expect(s.fearRange).toHaveLength(2)
        expect(s.fearRange[0]).toBeLessThanOrEqual(s.fearRange[1])
      })
    })
  })

  // ── État initial ──────────────────────────────────────

  describe('état initial', () => {
    it('a des valeurs par défaut correctes', () => {
      expect(store.pcCount).toBe(4)
      expect(store.selectedTier).toBe(1)
      expect(store.encounterName).toBe('')
      expect(store.selectedIntensity).toBe('standard')
      expect(store.activeAdjustments).toEqual([])
      expect(store.adversarySlots).toEqual([])
      expect(store.selectedEnvironmentId).toBeNull()
    })

    it('calcule 14 BP de base pour 4 PJ', () => {
      expect(store.baseBattlePoints).toBe(14)
      expect(store.totalBattlePoints).toBe(14)
      expect(store.remainingBattlePoints).toBe(14)
      expect(store.spentBattlePoints).toBe(0)
    })
  })

  // ── Configuration ─────────────────────────────────────

  describe('configuration', () => {
    it('change le nombre de PJ avec clamp', () => {
      store.setPcCount(6)
      expect(store.pcCount).toBe(6)
      expect(store.baseBattlePoints).toBe(20)

      store.setPcCount(1)
      expect(store.pcCount).toBe(2) // min

      store.setPcCount(10)
      expect(store.pcCount).toBe(8) // max
    })

    it('change le tier', () => {
      store.setTier(3)
      expect(store.selectedTier).toBe(3)

      store.setTier(0) // invalide
      expect(store.selectedTier).toBe(3) // inchangé

      store.setTier(5) // invalide
      expect(store.selectedTier).toBe(3)
    })

    it('change l\'intensité', () => {
      store.setIntensity('climactic')
      expect(store.selectedIntensity).toBe('climactic')
      expect(store.currentIntensity.id).toBe('climactic')
      expect(store.currentIntensity.fearRange).toEqual([6, 12])

      store.setIntensity('invalid')
      expect(store.selectedIntensity).toBe('climactic') // inchangé
    })
  })

  // ── Ajustements ───────────────────────────────────────

  describe('ajustements BP', () => {
    it('toggle un ajustement', () => {
      store.toggleAdjustment('easier')
      expect(store.activeAdjustments).toContain('easier')
      expect(store.adjustmentTotal).toBe(-1)
      expect(store.totalBattlePoints).toBe(13)

      store.toggleAdjustment('easier')
      expect(store.activeAdjustments).not.toContain('easier')
      expect(store.totalBattlePoints).toBe(14)
    })

    it('cumule plusieurs ajustements', () => {
      store.toggleAdjustment('harder') // +2
      store.toggleAdjustment('no-heavy-hitters') // +1
      expect(store.adjustmentTotal).toBe(3)
      expect(store.totalBattlePoints).toBe(17)
    })

    it('ne descend pas en dessous de 0 BP', () => {
      store.setPcCount(2) // base = 8
      store.toggleAdjustment('easier') // -1
      store.toggleAdjustment('multi-solo') // -2
      store.toggleAdjustment('damage-boost') // -2
      // 8 - 5 = 3, toujours > 0
      expect(store.totalBattlePoints).toBe(3)
    })
  })

  // ── Composition d'adversaires ─────────────────────────

  describe('composition adversaires', () => {
    const sampleAdversary = allAdversaries[0] // Premier adversaire disponible

    it('ajoute un adversaire', () => {
      store.addAdversary(sampleAdversary.id)
      expect(store.adversarySlots).toHaveLength(1)
      expect(store.adversarySlots[0].quantity).toBe(1)
      expect(store.totalAdversaryCount).toBe(1)
    })

    it('incrémente la quantité d\'un adversaire existant', () => {
      store.addAdversary(sampleAdversary.id)
      store.addAdversary(sampleAdversary.id)
      expect(store.adversarySlots).toHaveLength(1)
      expect(store.adversarySlots[0].quantity).toBe(2)
      expect(store.totalAdversaryCount).toBe(2)
    })

    it('ajoute avec quantité spécifique', () => {
      store.addAdversary(sampleAdversary.id, 3)
      expect(store.adversarySlots[0].quantity).toBe(3)
    })

    it('retire un adversaire', () => {
      store.addAdversary(sampleAdversary.id, 3)
      store.removeAdversary(sampleAdversary.id)
      expect(store.adversarySlots[0].quantity).toBe(2)
    })

    it('supprime le slot quand quantité arrive à 0', () => {
      store.addAdversary(sampleAdversary.id)
      store.removeAdversary(sampleAdversary.id)
      expect(store.adversarySlots).toHaveLength(0)
    })

    it('définit la quantité exacte', () => {
      store.addAdversary(sampleAdversary.id)
      store.setAdversaryQuantity(sampleAdversary.id, 5)
      expect(store.adversarySlots[0].quantity).toBe(5)
    })

    it('supprime le slot si quantité définie à 0', () => {
      store.addAdversary(sampleAdversary.id, 3)
      store.setAdversaryQuantity(sampleAdversary.id, 0)
      expect(store.adversarySlots).toHaveLength(0)
    })

    it('calcule les BP dépensés correctement', () => {
      // Trouver un adversaire Standard (coût 2)
      const standard = allAdversaries.find((a) => a.type === 'Standard')
      if (standard) {
        store.addAdversary(standard.id, 2)
        expect(store.spentBattlePoints).toBe(4) // 2 × 2
      }
    })

    it('calcule le HP et Stress totaux', () => {
      store.addAdversary(sampleAdversary.id, 2)
      const detailed = store.adversarySlotsDetailed[0]
      expect(store.totalAdversaryHP).toBe(detailed.adversary.hp * 2)
      expect(store.totalAdversaryStress).toBe(detailed.adversary.stress * 2)
    })

    it('ignore les IDs invalides dans les détails', () => {
      store.adversarySlots.push({ adversaryId: 'nonexistent', quantity: 1 })
      expect(store.adversarySlotsDetailed).toHaveLength(0) // filtré
    })
  })

  // ── Environnement ─────────────────────────────────────

  describe('environnement', () => {
    it('sélectionne un environnement', () => {
      store.setEnvironment('raging-river')
      expect(store.selectedEnvironmentId).toBe('raging-river')
      expect(store.selectedEnvironment).not.toBeNull()
      expect(store.selectedEnvironment.name).toBe('Raging River')
    })

    it('désélectionne avec null', () => {
      store.setEnvironment('raging-river')
      store.setEnvironment(null)
      expect(store.selectedEnvironment).toBeNull()
    })

    it('retourne null pour un ID invalide', () => {
      store.setEnvironment('nonexistent')
      expect(store.selectedEnvironment).toBeNull()
    })
  })

  // ── Warnings ──────────────────────────────────────────

  describe('warnings', () => {
    it('avertit si budget dépassé', () => {
      const solo = allAdversaries.find((a) => a.type === 'Solo')
      if (solo) {
        store.setPcCount(2) // 8 BP
        store.addAdversary(solo.id, 2) // 10 BP
        const errors = store.warnings.filter((w) => w.type === 'error')
        expect(errors.length).toBeGreaterThan(0)
      }
    })

    it('avertit si BP restants élevés', () => {
      const minion = allAdversaries.find((a) => a.type === 'Minion')
      if (minion) {
        store.addAdversary(minion.id) // 1 BP sur 14
        const warns = store.warnings.filter((w) => w.type === 'warning' && w.message.includes('restant'))
        expect(warns.length).toBeGreaterThan(0)
      }
    })

    it('suggère ajustement multi-solo', () => {
      const solo = allAdversaries.find((a) => a.type === 'Solo')
      if (solo) {
        store.setPcCount(8) // 26 BP
        store.addAdversary(solo.id, 2) // 2 Solo
        const infos = store.warnings.filter((w) => w.message.includes('Solo'))
        expect(infos.length).toBeGreaterThan(0)
      }
    })

    it('suggère ajustement no-heavy-hitters', () => {
      const standard = allAdversaries.find((a) => a.type === 'Standard')
      if (standard) {
        store.addAdversary(standard.id)
        const infos = store.warnings.filter((w) => w.message.includes('Bruiser'))
        expect(infos.length).toBeGreaterThan(0)
      }
    })

    it('avertit si pas d\'environnement', () => {
      const standard = allAdversaries.find((a) => a.type === 'Standard')
      if (standard) {
        store.addAdversary(standard.id)
        const infos = store.warnings.filter((w) => w.message.includes('environnement'))
        expect(infos.length).toBeGreaterThan(0)
      }
    })

    it('avertit en cas de mismatch de tier', () => {
      store.setTier(1)
      const t2 = allAdversaries.find((a) => a.tier === 2)
      if (t2) {
        store.addAdversary(t2.id)
        const warns = store.warnings.filter((w) => w.message.includes('tier'))
        expect(warns.length).toBeGreaterThan(0)
      }
    })
  })

  // ── Validité ──────────────────────────────────────────

  describe('isValid', () => {
    it('est invalide sans adversaire', () => {
      expect(store.isValid).toBe(false)
    })

    it('est valide avec adversaires et budget respecté', () => {
      const standard = allAdversaries.find((a) => a.type === 'Standard')
      if (standard) {
        store.addAdversary(standard.id, 2) // 4 BP sur 14
        expect(store.isValid).toBe(true)
      }
    })

    it('est invalide si budget dépassé', () => {
      const solo = allAdversaries.find((a) => a.type === 'Solo')
      if (solo) {
        store.setPcCount(2) // 8 BP
        store.addAdversary(solo.id, 3) // 15 BP
        expect(store.isValid).toBe(false)
      }
    })
  })

  // ── Sérialisation ─────────────────────────────────────

  describe('sérialisation', () => {
    it('sérialise l\'état complet', () => {
      store.encounterName = 'Test Encounter'
      store.setPcCount(5)
      store.setTier(2)
      const standard = allAdversaries.find((a) => a.type === 'Standard')
      if (standard) store.addAdversary(standard.id, 2)
      store.setEnvironment('raging-river')

      const data = store.serializeEncounter()
      expect(data.name).toBe('Test Encounter')
      expect(data.pcCount).toBe(5)
      expect(data.tier).toBe(2)
      expect(data.adversarySlots).toHaveLength(1)
      expect(data.environmentId).toBe('raging-river')
      expect(data.id).toBeTruthy()
      expect(data.createdAt).toBeTruthy()
    })

    it('charge une rencontre sérialisée', () => {
      const data = {
        name: 'Loaded Encounter',
        pcCount: 3,
        tier: 3,
        intensity: 'major',
        adjustments: ['harder'],
        adversarySlots: [{ adversaryId: allAdversaries[0].id, quantity: 2 }],
        environmentId: 'raging-river'
      }

      store.loadEncounter(data)
      expect(store.encounterName).toBe('Loaded Encounter')
      expect(store.pcCount).toBe(3)
      expect(store.selectedTier).toBe(3)
      expect(store.selectedIntensity).toBe('major')
      expect(store.activeAdjustments).toContain('harder')
      expect(store.adversarySlots).toHaveLength(1)
      expect(store.selectedEnvironmentId).toBe('raging-river')
    })
  })

  // ── Reset ─────────────────────────────────────────────

  describe('reset', () => {
    it('réinitialise la rencontre', () => {
      store.encounterName = 'To Reset'
      store.addAdversary(allAdversaries[0].id, 3)
      store.setEnvironment('raging-river')
      store.toggleAdjustment('harder')

      store.resetEncounter()

      expect(store.encounterName).toBe('')
      expect(store.adversarySlots).toHaveLength(0)
      expect(store.selectedEnvironmentId).toBeNull()
      expect(store.activeAdjustments).toHaveLength(0)
      expect(store.selectedIntensity).toBe('standard')
    })
  })
})
