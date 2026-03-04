// @vitest-environment jsdom
/**
 * @module dice/__tests__/diceStore.test
 * @description Tests unitaires du module Lanceur de Dés (Sprint 5).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// ── Mock useStorage ──────────────────────────────────────
const mockStore = { value: [] }
vi.mock('@core/composables/useStorage', () => ({
  useStorage: () => ({
    data: mockStore,
    save: (val) => { mockStore.value = JSON.parse(JSON.stringify(val)) },
    error: null
  })
}))

import { useDiceStore } from '../stores/diceStore'
import {
  DUALITY_OUTCOMES,
  resolveDualityOutcome,
  calculateCriticalDamage,
  QUICK_DICE,
  ROLL_PRESETS,
  MAX_HISTORY
} from '../constants'

// ═════════════════════════════════════════════════════════
// CONSTANTS
// ═════════════════════════════════════════════════════════

describe('Dice constants', () => {
  it('has 5 duality outcomes', () => {
    expect(Object.keys(DUALITY_OUTCOMES)).toHaveLength(5)
    expect(DUALITY_OUTCOMES.critical).toBeDefined()
    expect(DUALITY_OUTCOMES.successHope).toBeDefined()
    expect(DUALITY_OUTCOMES.successFear).toBeDefined()
    expect(DUALITY_OUTCOMES.failureHope).toBeDefined()
    expect(DUALITY_OUTCOMES.failureFear).toBeDefined()
  })

  it('each outcome has required fields', () => {
    for (const outcome of Object.values(DUALITY_OUTCOMES)) {
      expect(outcome.id).toBeTruthy()
      expect(outcome.label).toBeTruthy()
      expect(outcome.shortLabel).toBeTruthy()
      expect(outcome.description).toBeTruthy()
      expect(outcome.color).toBeTruthy()
      expect(outcome.icon).toBeTruthy()
    }
  })

  it('has 6 quick dice', () => {
    expect(QUICK_DICE).toHaveLength(6)
    expect(QUICK_DICE.map((d) => d.sides)).toEqual([4, 6, 8, 10, 12, 20])
  })

  it('has 5 roll presets', () => {
    expect(ROLL_PRESETS).toHaveLength(5)
    expect(ROLL_PRESETS.find((p) => p.id === 'duality')).toBeTruthy()
    expect(ROLL_PRESETS.find((p) => p.id === 'gm-d20')).toBeTruthy()
    expect(ROLL_PRESETS.find((p) => p.id === 'damage')).toBeTruthy()
  })

  it('MAX_HISTORY is 50', () => {
    expect(MAX_HISTORY).toBe(50)
  })
})

// ═════════════════════════════════════════════════════════
// resolveDualityOutcome
// ═════════════════════════════════════════════════════════

describe('resolveDualityOutcome', () => {
  it('matching dice → critical', () => {
    expect(resolveDualityOutcome(7, 7, 14, 10)).toBe('critical')
    expect(resolveDualityOutcome(1, 1, 2, 15)).toBe('critical') // Crit even if under difficulty
    expect(resolveDualityOutcome(12, 12, 24, null)).toBe('critical')
  })

  it('success with hope: total ≥ difficulty AND hope > fear', () => {
    expect(resolveDualityOutcome(8, 5, 15, 12)).toBe('successHope')
  })

  it('success with fear: total ≥ difficulty AND fear > hope', () => {
    expect(resolveDualityOutcome(5, 8, 15, 12)).toBe('successFear')
  })

  it('failure with hope: total < difficulty AND hope > fear', () => {
    expect(resolveDualityOutcome(6, 3, 9, 15)).toBe('failureHope')
  })

  it('failure with fear: total < difficulty AND fear > hope', () => {
    expect(resolveDualityOutcome(3, 6, 9, 15)).toBe('failureFear')
  })

  it('no difficulty → success based on hope/fear only', () => {
    expect(resolveDualityOutcome(8, 5, 13, null)).toBe('successHope')
    expect(resolveDualityOutcome(5, 8, 13, null)).toBe('successFear')
  })

  it('modifier included in total comparison', () => {
    // hope=6, fear=4, modifier=+3, total=13, diff=12 → success with hope
    expect(resolveDualityOutcome(6, 4, 13, 12)).toBe('successHope')
    // Same dice but diff=14 → failure with hope
    expect(resolveDualityOutcome(6, 4, 13, 14)).toBe('failureHope')
  })
})

// ═════════════════════════════════════════════════════════
// calculateCriticalDamage
// ═════════════════════════════════════════════════════════

describe('calculateCriticalDamage', () => {
  it('adds max dice to total', () => {
    // 2d8+1 crit: rolls [5,3] → 5+3+1+(2×8) = 25
    const result = calculateCriticalDamage([5, 3], 8, 1)
    expect(result.maxBonus).toBe(16) // 2 × 8
    expect(result.total).toBe(25) // 8 + 1 + 16
  })

  it('handles single die', () => {
    // 1d10+2 crit: roll [7] → 7+2+10 = 19
    const result = calculateCriticalDamage([7], 10, 2)
    expect(result.maxBonus).toBe(10)
    expect(result.total).toBe(19)
  })

  it('handles zero modifier', () => {
    const result = calculateCriticalDamage([4, 6], 6, 0)
    expect(result.total).toBe(10 + 12) // 10 + 2×6
  })

  it('handles 3d6+2 crit', () => {
    const result = calculateCriticalDamage([3, 5, 2], 6, 2)
    expect(result.maxBonus).toBe(18) // 3 × 6
    expect(result.total).toBe(10 + 2 + 18) // 30
  })
})

// ═════════════════════════════════════════════════════════
// STORE
// ═════════════════════════════════════════════════════════

describe('diceStore', () => {
  let store

  beforeEach(() => {
    mockStore.value = []
    setActivePinia(createPinia())
    store = useDiceStore()
    store.clearHistory()
  })

  describe('initial state', () => {
    it('starts with empty history', () => {
      expect(store.history).toEqual([])
      expect(store.historyCount).toBe(0)
      expect(store.lastResult).toBeNull()
    })
  })

  describe('rollDuality', () => {
    it('produces a valid duality result', () => {
      const result = store.rollDuality()
      expect(result).toBeDefined()
      expect(result.type).toBe('duality')
      expect(result.hopeValue).toBeGreaterThanOrEqual(1)
      expect(result.hopeValue).toBeLessThanOrEqual(12)
      expect(result.fearValue).toBeGreaterThanOrEqual(1)
      expect(result.fearValue).toBeLessThanOrEqual(12)
      expect(result.total).toBe(result.hopeValue + result.fearValue)
      expect(result.outcome).toBeTruthy()
      expect(result.outcomeData).toBeTruthy()
    })

    it('applies modifier', () => {
      const result = store.rollDuality({ modifier: 3 })
      expect(result.modifier).toBe(3)
      expect(result.total).toBe(result.hopeValue + result.fearValue + 3)
    })

    it('stores difficulty', () => {
      const result = store.rollDuality({ difficulty: 15 })
      expect(result.difficulty).toBe(15)
    })

    it('adds to history', () => {
      store.rollDuality()
      expect(store.historyCount).toBe(1)
      expect(store.lastResult.type).toBe('duality')
    })

    it('handles advantage (d6 positive)', () => {
      const result = store.rollDuality({ advantage: true })
      expect(result.advantageDie).toBeGreaterThanOrEqual(1)
      expect(result.advantageDie).toBeLessThanOrEqual(6)
      expect(result.advantageModifier).toBe(result.advantageDie)
      expect(result.total).toBe(result.hopeValue + result.fearValue + result.advantageDie)
    })

    it('handles disadvantage (d6 negative)', () => {
      const result = store.rollDuality({ disadvantage: true })
      expect(result.advantageDie).toBeGreaterThanOrEqual(1)
      expect(result.advantageModifier).toBe(-result.advantageDie)
      expect(result.total).toBe(result.hopeValue + result.fearValue - result.advantageDie)
    })

    it('advantage + disadvantage cancel (no extra die)', () => {
      const result = store.rollDuality({ advantage: true, disadvantage: true })
      expect(result.advantageDie).toBeNull()
      expect(result.advantageModifier).toBe(0)
    })
  })

  describe('rollGM', () => {
    it('rolls a d20', () => {
      const result = store.rollGM()
      expect(result.type).toBe('gm-d20')
      expect(result.value).toBeGreaterThanOrEqual(1)
      expect(result.value).toBeLessThanOrEqual(20)
      expect(result.total).toBe(result.value)
    })

    it('applies modifier', () => {
      const result = store.rollGM({ modifier: 5 })
      expect(result.total).toBe(result.value + 5)
    })

    it('evaluates success vs target', () => {
      const result = store.rollGM({ target: 10 })
      expect(typeof result.success).toBe('boolean')
      expect(result.success).toBe(result.total >= 10)
    })

    it('detects natural 20', () => {
      // Run many times to try to get a nat20 (probabilistic)
      let gotNat20 = false
      for (let i = 0; i < 200; i++) {
        const r = store.rollGM()
        if (r.natural20) {
          gotNat20 = true
          expect(r.value).toBe(20)
          break
        }
      }
      // It's possible but extremely unlikely to fail (1/20 chance per roll)
      expect(gotNat20).toBe(true)
    })

    it('null target → success is null', () => {
      const result = store.rollGM({ target: null })
      expect(result.success).toBeNull()
    })
  })

  describe('rollDamage', () => {
    it('rolls a damage expression', () => {
      const result = store.rollDamage({ expression: '2d8+4' })
      expect(result.type).toBe('damage')
      expect(result.rolls).toHaveLength(2)
      expect(result.modifier).toBe(4)
      result.rolls.forEach((r) => {
        expect(r).toBeGreaterThanOrEqual(1)
        expect(r).toBeLessThanOrEqual(8)
      })
      const rollSum = result.rolls.reduce((s, r) => s + r, 0)
      expect(result.total).toBe(rollSum + 4)
    })

    it('handles critical damage', () => {
      const result = store.rollDamage({ expression: '2d8+1', critical: true })
      expect(result.critical).toBe(true)
      expect(result.criticalData).toBeDefined()
      expect(result.criticalData.maxBonus).toBe(16) // 2 × 8
      const rollSum = result.rolls.reduce((s, r) => s + r, 0)
      expect(result.total).toBe(rollSum + 1 + 16)
    })

    it('returns null for invalid expression', () => {
      expect(store.rollDamage({ expression: 'not-a-dice' })).toBeNull()
    })

    it('returns null for empty expression', () => {
      expect(store.rollDamage({ expression: '' })).toBeNull()
    })
  })

  describe('rollQuick', () => {
    it('rolls a single die', () => {
      const result = store.rollQuick(20)
      expect(result.type).toBe('quick')
      expect(result.sides).toBe(20)
      expect(result.count).toBe(1)
      expect(result.rolls).toHaveLength(1)
      expect(result.total).toBe(result.rolls[0])
    })

    it('rolls multiple dice', () => {
      const result = store.rollQuick(6, 3)
      expect(result.rolls).toHaveLength(3)
      expect(result.total).toBe(result.rolls.reduce((s, r) => s + r, 0))
    })
  })

  describe('history management', () => {
    it('adds rolls to history (most recent first)', () => {
      store.rollQuick(6)
      store.rollQuick(8)
      expect(store.historyCount).toBe(2)
      expect(store.history[0].sides).toBe(8) // Most recent
      expect(store.history[1].sides).toBe(6)
    })

    it('caps history at MAX_HISTORY', () => {
      for (let i = 0; i < 60; i++) {
        store.rollQuick(6)
      }
      expect(store.historyCount).toBe(MAX_HISTORY) // 50
    })

    it('tracks lastResult', () => {
      const r = store.rollQuick(12)
      expect(store.lastResult.id).toBe(r.id)
    })

    it('clearHistory empties everything', () => {
      store.rollQuick(6)
      store.rollDuality()
      store.clearHistory()
      expect(store.historyCount).toBe(0)
      expect(store.lastResult).toBeNull()
    })
  })

  describe('mixed rolls in history', () => {
    it('stores different roll types', () => {
      store.rollDuality()
      store.rollGM()
      store.rollDamage({ expression: '1d6' })
      store.rollQuick(10)

      expect(store.historyCount).toBe(4)
      const types = store.history.map((e) => e.type)
      expect(types).toContain('duality')
      expect(types).toContain('gm-d20')
      expect(types).toContain('damage')
      expect(types).toContain('quick')
    })
  })
})
