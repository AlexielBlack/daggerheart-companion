// @vitest-environment jsdom
/**
 * @module levelup/__tests__/moduleIndex.test
 * @description Valide que l'index du module exporte correctement
 * tous les éléments de l'API publique.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock useStorage (requis par les stores) ──
vi.mock('@core/composables/useStorage', () => ({
  useStorage: () => ({
    data: { value: [] },
    save: () => {},
    error: null
  })
}))

// ── Import depuis l'index ──
import {
  // Store
  useLevelUpStore,
  WIZARD_STEPS,
  STEP_ORDER,
  STEP_LABELS,

  // Composable — Tiers & niveaux
  getTierForLevel,
  hasTierAchievement,
  shouldClearTraits,
  getTierAchievement,
  canLevelUp,

  // Composable — Slots & advancements
  getUsedSlots,
  getAdvancementDef,
  getRemainingSlots,
  getAvailableAdvancements,
  validateAdvancementChoices,

  // Composable — Application & rollback
  buildLevelUpEntry,
  applyLevelUp,
  canRollback,
  rollbackLevelUp,

  // Constantes
  MAX_LEVEL,
  TIER_ACHIEVEMENT_LEVELS,
  TRAIT_CLEAR_LEVELS,
  ADVANCEMENT_TYPES,
  TRAIT_IDS,
  TIER_ADVANCEMENT_POOLS,

  // Composants Vue
  LevelUpWizard,
  TierAchievementStep,
  AdvancementStep,
  ThresholdStep,
  DomainCardStep,
  LevelUpSummary
} from '../index'

describe('levelup module index', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ── Store ──

  describe('store exports', () => {
    it('exporte useLevelUpStore comme fonction', () => {
      expect(typeof useLevelUpStore).toBe('function')
    })

    it('useLevelUpStore retourne un store fonctionnel', () => {
      const store = useLevelUpStore()
      expect(store).toBeDefined()
      expect(store.isOpen).toBe(false)
      expect(typeof store.open).toBe('function')
      expect(typeof store.close).toBe('function')
      expect(typeof store.finalize).toBe('function')
    })

    it('exporte WIZARD_STEPS', () => {
      expect(WIZARD_STEPS).toBeDefined()
      expect(WIZARD_STEPS.TIER_ACHIEVEMENT).toBe('tier_achievement')
      expect(WIZARD_STEPS.ADVANCEMENTS).toBe('advancements')
      expect(WIZARD_STEPS.THRESHOLDS).toBe('thresholds')
      expect(WIZARD_STEPS.DOMAIN_CARD).toBe('domain_card')
    })

    it('exporte STEP_ORDER avec 4 etapes', () => {
      expect(Array.isArray(STEP_ORDER)).toBe(true)
      expect(STEP_ORDER).toHaveLength(4)
    })

    it('exporte STEP_LABELS', () => {
      expect(STEP_LABELS).toBeDefined()
      expect(typeof STEP_LABELS[WIZARD_STEPS.TIER_ACHIEVEMENT]).toBe('string')
    })
  })

  // ── Composable — fonctions pures ──

  describe('composable exports — tiers et niveaux', () => {
    it('getTierForLevel est fonctionnel', () => {
      expect(getTierForLevel(1)).toBe(1)
      expect(getTierForLevel(3)).toBe(2)
      expect(getTierForLevel(6)).toBe(3)
      expect(getTierForLevel(9)).toBe(4)
    })

    it('hasTierAchievement est fonctionnel', () => {
      expect(hasTierAchievement(2)).toBe(true)
      expect(hasTierAchievement(3)).toBe(false)
    })

    it('shouldClearTraits est fonctionnel', () => {
      expect(shouldClearTraits(5)).toBe(true)
      expect(shouldClearTraits(3)).toBe(false)
    })

    it('getTierAchievement est fonctionnel', () => {
      expect(getTierAchievement(2)).toEqual({
        newExperience: true,
        proficiencyIncrease: true,
        traitsCleared: false
      })
    })

    it('canLevelUp est fonctionnel', () => {
      const result = canLevelUp(null)
      expect(result.canLevel).toBe(false)
    })
  })

  describe('composable exports — slots et advancements', () => {
    it('getUsedSlots est fonctionnel', () => {
      expect(typeof getUsedSlots).toBe('function')
      expect(getUsedSlots([], 2, 'hp')).toBe(0)
    })

    it('getAdvancementDef est fonctionnel', () => {
      const def = getAdvancementDef(2, 'hp')
      expect(def).toBeDefined()
      expect(def.maxSlots).toBe(2)
    })

    it('getRemainingSlots est fonctionnel', () => {
      expect(typeof getRemainingSlots).toBe('function')
    })

    it('getAvailableAdvancements est fonctionnel', () => {
      expect(typeof getAvailableAdvancements).toBe('function')
    })

    it('validateAdvancementChoices est fonctionnel', () => {
      expect(typeof validateAdvancementChoices).toBe('function')
    })
  })

  describe('composable exports — application et rollback', () => {
    it('buildLevelUpEntry est fonctionnel', () => {
      expect(typeof buildLevelUpEntry).toBe('function')
    })

    it('applyLevelUp est fonctionnel', () => {
      expect(typeof applyLevelUp).toBe('function')
    })

    it('canRollback est fonctionnel', () => {
      const result = canRollback(null)
      expect(result.canRollback).toBe(false)
    })

    it('rollbackLevelUp est fonctionnel', () => {
      expect(typeof rollbackLevelUp).toBe('function')
    })
  })

  // ── Constantes ──

  describe('constantes exports', () => {
    it('MAX_LEVEL = 10', () => {
      expect(MAX_LEVEL).toBe(10)
    })

    it('TIER_ACHIEVEMENT_LEVELS', () => {
      expect(TIER_ACHIEVEMENT_LEVELS).toEqual([2, 5, 8])
    })

    it('TRAIT_CLEAR_LEVELS', () => {
      expect(TRAIT_CLEAR_LEVELS).toEqual([5, 8])
    })

    it('ADVANCEMENT_TYPES contient les types attendus', () => {
      expect(ADVANCEMENT_TYPES.HP).toBe('hp')
      expect(ADVANCEMENT_TYPES.STRESS).toBe('stress')
      expect(ADVANCEMENT_TYPES.TRAITS).toBe('traits')
      expect(ADVANCEMENT_TYPES.EVASION).toBe('evasion')
      expect(ADVANCEMENT_TYPES.PROFICIENCY).toBe('proficiency')
    })

    it('TRAIT_IDS contient 6 traits', () => {
      expect(TRAIT_IDS).toHaveLength(6)
      expect(TRAIT_IDS).toContain('agility')
      expect(TRAIT_IDS).toContain('knowledge')
    })

    it('TIER_ADVANCEMENT_POOLS contient les tiers 2-4', () => {
      expect(TIER_ADVANCEMENT_POOLS[2]).toBeDefined()
      expect(TIER_ADVANCEMENT_POOLS[3]).toBeDefined()
      expect(TIER_ADVANCEMENT_POOLS[4]).toBeDefined()
    })
  })

  // ── Composants Vue ──

  describe('composants Vue exports', () => {
    it('LevelUpWizard est un composant', () => {
      expect(LevelUpWizard).toBeDefined()
      expect(LevelUpWizard.name).toBe('LevelUpWizard')
    })

    it('TierAchievementStep est un composant', () => {
      expect(TierAchievementStep).toBeDefined()
      expect(TierAchievementStep.name).toBe('TierAchievementStep')
    })

    it('AdvancementStep est un composant', () => {
      expect(AdvancementStep).toBeDefined()
      expect(AdvancementStep.name).toBe('AdvancementStep')
    })

    it('ThresholdStep est un composant', () => {
      expect(ThresholdStep).toBeDefined()
      expect(ThresholdStep.name).toBe('ThresholdStep')
    })

    it('DomainCardStep est un composant', () => {
      expect(DomainCardStep).toBeDefined()
      expect(DomainCardStep.name).toBe('DomainCardStep')
    })

    it('LevelUpSummary est un composant', () => {
      expect(LevelUpSummary).toBeDefined()
      expect(LevelUpSummary.name).toBe('LevelUpSummary')
    })
  })
})
